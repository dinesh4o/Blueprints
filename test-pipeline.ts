import { runPipeline } from './src/lib/agents/workflow';

async function test() {
  const testMolecule = "Aspirin"; // You can change this to any drug
  console.log(`Starting LangGraph Pipeline test for: ${testMolecule}\n`);
  
  try {
    const startTime = Date.now();
    
    // Run the pipeline
    const result = await runPipeline(testMolecule);
    
    const endTime = Date.now();
    console.log(`\nPipeline completed in ${(endTime - startTime) / 1000} seconds!`);
    console.log("\n--- Final Pipeline Result State ---");
    console.log("Molecule:", result.molecule);
    console.log(`Clinical Trials Found: ${result.clinicalData?.length || 0}`);
    console.log(`Literature Papers Found: ${result.literatureData?.length || 0}`);
    console.log(`Target Data:`, result.targetData);
    
    console.log("\n--- Groq LLM Evaluation ---");
    console.log("Viability Score:", result.viabilityScore);
    console.log("Analysis Report:\n", result.analysisReport);
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
