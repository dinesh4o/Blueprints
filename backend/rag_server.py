import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
load_dotenv()

# Chroma and LangChain
import chromadb
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
import json
from phoenix.router import router as phoenix_router

app = FastAPI(title="Ephemeral RAG Server")

app.include_router(phoenix_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.environ.get("CLIENT_URL", "https://luvara.vercel.app"),
        "https://luvara.vercel.app",
        "https://blueprints-backend-yc9s.onrender.com",
    ],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Initialize Chroma Ephemeral Client (In-Memory)
chroma_client = chromadb.EphemeralClient()

# Free HuggingFace Embeddings (Runs locally, no API key needed)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# We will store active rag chains by report ID to act as in-memory session RAG
active_chains = {}

class InitRagRequest(BaseModel):
    report_id: str
    report_data: Dict[str, Any]

class ChatRequest(BaseModel):
    report_id: str
    message: str

def get_llm():
    # Use Groq via Langchain ChatOpenAI adapter, since Groq is OpenAI compatible
    groq_key = os.environ.get("GROQ_API_KEY") or os.environ.get("GROQ_KEY")
    if not groq_key:
        print("Warning: GROQ_API_KEY not set")
    
    return ChatOpenAI(
        # base_url="https://api.groq.com/openai/v1",
        base_url="http://172.28.30.240:8080/v1",
        api_key=groq_key or "no-key",
        # model="llama-3.3-70b-versatile",
        model="qwen2.5-coder-7b-instruct",
        temperature=0.0
    )


@app.post("/api/rag/init")
async def init_rag(req: InitRagRequest):
    try:
        # 1. Convert report JSON into text
        report_text = json.dumps(req.report_data, indent=2)
        
        # 2. Chunk the document
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.create_documents([report_text])
        
        # 3. Create Ephemeral Chroma Collection for this report
        collection_name = f"report_{req.report_id}"
        
        # Delete if exists to recreate
        try:
            chroma_client.delete_collection(collection_name)
        except Exception:
            pass
            
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            client=chroma_client,
            collection_name=collection_name
        )
        
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        
        # Store just the retriever
        active_chains[req.report_id] = retriever
        
        return {"status": "success", "message": f"Ephemeral RAG initialized for {req.report_id} using Chroma."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/chat")
async def chat(req: ChatRequest):
    if req.report_id not in active_chains:
        raise HTTPException(status_code=400, detail="RAG not initialized for this report. Please init first.")
        
    retriever = active_chains[req.report_id]
    try:
        # Retrieve docs
        retriever.search_kwargs = {"k": 10}; docs = retriever.invoke(req.message)
        context = "\n\n".join([d.page_content for d in docs])
        
        # Call LLM directly to avoid legacy pydantic issues in langchain.chains
        prompt = f"""You are Phoenix, an expert pharmaceutical AI assistant helping a researcher analyze a clinical report on a medical compound.
Use the report context below as your primary source. Cite specific data when available.
You may also draw on your general pharmaceutical and biomedical knowledge to provide helpful, scientifically grounded answers — for example, explaining mechanisms of action, drug classes, or clinical context.
If a question is completely unrelated to medicine, pharmacology, or drug science (e.g. writing code, pop culture), politely decline and redirect to the report.
Keep answers concise and scientifically accurate.

Report Context: {context}

Question: {req.message}"""

        llm = get_llm()
        response = llm.invoke(prompt)
        
        return {"answer": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)
