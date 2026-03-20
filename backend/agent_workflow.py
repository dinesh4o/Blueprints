import os
import json
import random
import time
import requests
from typing import TypedDict, Any, List, Annotated
import operator

# Core LangGraph imports
from langgraph.graph import StateGraph, START, END
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
load_dotenv()

# 1. Define the State schema using TypedDict
# We use Annotation/reducers to tell LangGraph how to handle state updates from parallel nodes
class GraphState(TypedDict):
    molecule: str
    clinicalData: Annotated[List[Any], operator.add]
    literatureData: Annotated[List[Any], operator.add]
    regulatoryData: dict
    targetData: dict
    patentData: dict
    analysisReport: str
    viabilityScore: float


# 2. Define the Nodes (The Agents)

# Node: Clinical Agent (ClinicalTrials.gov API)
def fetch_clinical_data(state: GraphState):
    molecule = state["molecule"]
    print(f"[ClinicalAgent] Fetching trials for {molecule}...")
    try:
        url = f"https://clinicaltrials.gov/api/v2/studies?query.term={molecule}&pageSize=10"
        res = requests.get(url)
        res.raise_for_status()
        studies = res.json().get("studies", [])
        
        clinical_data = []
        for s in studies:
            protocol = s.get("protocolSection", {})
            clinical_data.append({
                "nctId": protocol.get("identificationModule", {}).get("nctId"),
                "status": protocol.get("statusModule", {}).get("overallStatus", "UNKNOWN"),
                "phase": (protocol.get("designModule", {}).get("phases") or ["Unknown"])[0],
                "condition": (protocol.get("conditionsModule", {}).get("conditions") or ["Unknown"])[0]
            })
        return {"clinicalData": clinical_data}
    except Exception as e:
        print("Clinical error:", e)
        return {"clinicalData": []}

# Node: Literature Agent (PubMed via NCBI E-utilities)
def fetch_literature_data(state: GraphState):
    molecule = state["molecule"]
    print(f"[LiteratureAgent] Fetching PubMed papers for {molecule}...")
    try:
        search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={molecule}+clinical+trial&retmode=json&retmax=5"
        search_res = requests.get(search_url).json()
        idlist = search_res.get("esearchresult", {}).get("idlist", [])
        
        if not idlist:
            return {"literatureData": []}
            
        pmids = ",".join(idlist)
        summary_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pmids}&retmode=json"
        summary_res = requests.get(summary_url).json()
        
        result_dict = summary_res.get("result", {})
        papers = [v for k, v in result_dict.items() if k != "uids"]
        
        literature_data = []
        for p in papers:
            pubdate = p.get("pubdate", "")
            literature_data.append({
                "title": p.get("title", ""),
                "journal": p.get("fulljournalname", ""),
                "year": pubdate.split(" ")[0] if pubdate else "Unknown",
            })
        return {"literatureData": literature_data}
    except Exception as e:
        print("Literature error:", e)
        return {"literatureData": []}

# Node: Regulatory Agent (openFDA API)
def fetch_regulatory_data(state: GraphState):
    molecule = state["molecule"]
    print(f"[RegulatoryAgent] Fetching FDA labels for {molecule}...")
    try:
        url = f'https://api.fda.gov/drug/label.json?search=openfda.generic_name:"{molecule}"&limit=1'
        res = requests.get(url)
        if res.status_code == 200:
            data = res.json()
            label = data.get("results", [{}])[0]
            inds = label.get("indications_and_usage", ["None"])[0][:200] if label.get("indications_and_usage") else "None"
            warns = label.get("boxed_warning", ["None"])[0][:200] if label.get("boxed_warning") else "None"
            return {"regulatoryData": {"indications": inds, "warnings": warns}}
        else:
            return {"regulatoryData": {"indications": "Investigational/Unknown", "warnings": "None found"}}
    except Exception as e:
        return {"regulatoryData": {"indications": "Investigational/Unknown", "warnings": "None found"}}

# Node: Target/Genetics Agent (Open Targets placeholder)
def fetch_target_data(state: GraphState):
    molecule = state["molecule"]
    print(f"[OpenTargetsAgent] Fetching targets for {molecule}...")
    return {"targetData": {"score": random.uniform(5.0, 10.0), "targetsFound": 5}}

# Node: Synthesis Agent (Groq LLM evaluation)
def synthesize_and_evaluate(state: GraphState):
    molecule = state["molecule"]
    print(f"[JudgeAgent] Synthesizing data for {molecule}...")
    
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
    # GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
    GROQ_API_URL = "http://172.28.30.240:8080/v1/chat/completions"


    prompt = f"""
    You are an expert Clinical Scientist and Patent Analyst Evaluation Agent.
    Evaluate the viability of the molecule "{molecule}".
    
    Data provided:
    - Clinical Trials: {json.dumps(state.get('clinicalData', []))}
    - Literature: {json.dumps(state.get('literatureData', []))}
    - Regulatory: {json.dumps(state.get('regulatoryData', {}))}
    - Target: {json.dumps(state.get('targetData', {}))}
    
    Output a JSON object ONLY with two keys:
    1. viabilityScore (0.0 to 10.0 scale based on safety, targets, and trial completion rates)
    2. analysisReport (A 3 paragraph expert summary highlighting risks, advantages, and scientific consensus)
    """
    
    payload = {
        # "model": "llama-3.3-70b-versatile",
        "model": "qwen2.5-coder-7b-instruct",
        "messages": [
            {"role": "system", "content": "You only respond with perfectly formatted JSON. Do not return anything outside the JSON object. Must be valid JSON."},
            {"role": "user", "content": prompt}
        ],
        # "response_format": {"type": "json_object"}
    }

    try:
        keys_str = os.getenv("GROQ_API_KEYS") or os.getenv("GROQ_API_KEY", "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")
        keys = [k.strip() for k in keys_str.split(",") if k.strip()]
        import random
        random.shuffle(keys)
        
        result_content = None
        last_err = None
        for key in keys:
            headers = {
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json"
            }
            try:
                res = requests.post(GROQ_API_URL, headers=headers, json=payload)
                if res.status_code in [429, 401]:
                     print(f"[JudgeAgent] Switch Key due to {res.status_code}")
                     continue
                res.raise_for_status()
                result_content = res.json()["choices"][0]["message"]["content"]
                break
            except Exception as e:
                last_err = e
                continue
                
        if not result_content:
             raise last_err or Exception("All API keys failed")
        
        content = result_content
        
        # Clean up Markdown response boundaries if the LLM adds them
        content = content.replace("```json", "").replace("```", "").strip()
        result = json.loads(content)
        
        return {
            "viabilityScore": float(result.get("viabilityScore", 0.0)),
            "analysisReport": str(result.get("analysisReport", ""))
        }
    except Exception as e:
        print("LLM Evaluation Error:", e)
        return {
            "viabilityScore": 0.0,
            "analysisReport": "Error synthesizing data. Check LLM connection or API keys."
        }


# 3. Build the LangGraph Workflow
workflow = StateGraph(GraphState)

# Add all node workers
workflow.add_node("fetchClinical", fetch_clinical_data)
workflow.add_node("fetchLiterature", fetch_literature_data)
workflow.add_node("fetchRegulatory", fetch_regulatory_data)
workflow.add_node("fetchTarget", fetch_target_data)
workflow.add_node("synthesize", synthesize_and_evaluate)

# Edge Map: Fan-out from Start
workflow.add_edge(START, "fetchClinical")
workflow.add_edge(START, "fetchLiterature")
workflow.add_edge(START, "fetchRegulatory")
workflow.add_edge(START, "fetchTarget")

# Edge Map: Fan-in to Synthesis
workflow.add_edge("fetchClinical", "synthesize")
workflow.add_edge("fetchLiterature", "synthesize")
workflow.add_edge("fetchRegulatory", "synthesize")
workflow.add_edge("fetchTarget", "synthesize")

workflow.add_edge("synthesize", END)

# Compile LangGraph app
app = workflow.compile()


# Example Execution
if __name__ == "__main__":
    test_molecule = "Aspirin"
    print(f"Starting Python LangGraph Pipeline test for: {test_molecule}\n")
    
    start_time = time.time()
    
    # Initialize an empty starting state dictionary
    initial_state = {
        "molecule": test_molecule,
        "clinicalData": [],
        "literatureData": [],
        "regulatoryData": {},
        "targetData": {},
        "patentData": {},
        "analysisReport": "",
        "viabilityScore": 0.0
    }
    
    # Run the graph
    result = app.invoke(initial_state)
    end_time = time.time()
    
    print(f"\nPipeline completed in {round(end_time - start_time, 2)} seconds!")
    print("\n--- Final Pipeline Result State ---")
    print("Molecule:", result.get("molecule"))
    print(f"Clinical Trials Found: {len(result.get('clinicalData', []))}")
    print(f"Literature Papers Found: {len(result.get('literatureData', []))}")
    print("Target Data:", result.get("targetData"))
    
    print("\n--- Groq LLM Evaluation ---")
    print("Viability Score:", result.get("viabilityScore"))
    print("Analysis Report:\n", result.get("analysisReport"))
