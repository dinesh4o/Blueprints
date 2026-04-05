/**
 * Translator Orchestrator
 * Translates natural language user messages into structured constraints
 * and agent actions for the multi-agent pipeline.
 */

interface TranslatorResult {
  constraints: Array<{ type: string; field: string; value: string }>;
  rerunAgents: string[];
  responseText: string;
  needsRerun: boolean;
}

/**
 * Calls Groq LLM to interpret the user's natural language message
 * in the context of an existing report and extract structured constraints.
 */
export async function translateUserMessage(
  message: string,
  molecule: string,
  existingReport: any,
  activeConstraints: Array<{ type: string; field: string; value: string }>,
  groqKeys: string[],
): Promise<TranslatorResult> {
  const reportSummary = existingReport ? `
Phoenix Score: ${existingReport.phoenix_score}/10
Clinical Trials: ${(existingReport.clinical_data || []).length}
Literature: ${(existingReport.literature_data || []).length} papers
Patents: ${(existingReport.patent_data || []).length}
FDA Labels: ${existingReport.regulatory_data?.fda_labels?.length || 0}
Top Opportunities: ${(existingReport.ai_analysis?.top_opportunities || []).join('; ')}
Top Risks: ${(existingReport.ai_analysis?.top_risks || []).join('; ')}
Debate Verdict: ${existingReport.debate_data?.consensus?.verdict || 'N/A'}
Active Constraints: ${activeConstraints.length > 0 ? JSON.stringify(activeConstraints) : 'None'}
Agent Attributions: ${(existingReport.agent_attributions || []).map((a: any) => `${a.agent}: ${a.insight}`).join('\n')}
Cross-Domain Reasoning: ${(existingReport.cross_domain_reasoning || []).map((r: any) => r.insight).join('\n')}
` : 'No existing report — first analysis.';

  const systemPrompt = `You are a pharmaceutical research assistant translator. Your job is to interpret the user's natural language message about drug "${molecule}" and translate it into structured actions.

Current report context:
${reportSummary}

You MUST respond with ONLY valid JSON in this exact format:
{
  "constraints": [{"type": "exclude_toxicity|require_indication|require_phase|exclude_condition|max_age|focus_agent", "field": "description", "value": "the constraint value"}],
  "rerunAgents": ["AgentName1", "AgentName2"],
  "responseText": "A helpful natural language response to the user explaining what you understood and what will happen",
  "needsRerun": true/false
}

Valid agent names: PlannerAgent, PubChemAgent, ClinicalAgent, LiteratureAgent, RegulatoryAgent, TargetAgent, PatentAgent, AnalogAgent, SynthesisAgent

Constraint types:
- "exclude_toxicity": Exclude results with specific toxicity (value = toxicity type)
- "require_indication": Focus on specific indication (value = disease/condition)
- "require_phase": Minimum clinical trial phase (value = "1", "2", "3", "4")
- "exclude_condition": Exclude a condition from results (value = condition name)
- "focus_agent": Tell a specific agent to prioritize something (value = focus description)

Rules:
- If the user asks a question about the existing data, set needsRerun=false and answer from the report context
- If the user wants to refine/narrow/filter results, extract constraints and set needsRerun=true
- If the user wants to re-analyze with different criteria, set needsRerun=true with appropriate rerunAgents
- If the user says "exclude X" or "ignore X", create an exclude constraint
- If the user says "focus on Y" or "only show Y", create a require constraint
- Keep responseText concise and informative`;

  for (const key of groqKeys) {
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (resp.status === 429 || resp.status === 401) continue;
      if (!resp.ok) continue;

      const data = await resp.json() as any;
      const content = data.choices?.[0]?.message?.content || '';
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
        rerunAgents: Array.isArray(parsed.rerunAgents) ? parsed.rerunAgents : [],
        responseText: parsed.responseText || 'I understood your request.',
        needsRerun: !!parsed.needsRerun,
      };
    } catch {
      continue;
    }
  }

  // Fallback: no keys worked
  return {
    constraints: [],
    rerunAgents: [],
    responseText: `I received your message about ${molecule}, but I'm having trouble processing it right now. Please try again.`,
    needsRerun: false,
  };
}
