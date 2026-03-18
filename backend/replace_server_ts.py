import sys

with open(r"X:\Hackathon\Blueprints\backend\server.ts", "r", encoding="utf-8") as f:
    text = f.read()

import re

# We will use Regex to replace the chat endpoint.
target_old = r"""  app\.post\('/api/claude/chat/:id', async \(req, res\) => \{
    const reportId = req\.params\.id;
    const \{ message \} = req\.body;
    const report = reports\.get\(reportId\);
    const GROQ_KEY = process\.env\.GROQ_API_KEY;

    if \(!GROQ_KEY\) \{
      return res\.status\(500\)\.json\(\{ error: 'GROQ_API_KEY not configured on the server\.' \}\);
    \}

    const mol       = report\?\.molecule \|\| 'Unknown compound';
    const topOpp    = \(report\?\.repurposing_candidates \|\| \[\]\)\.slice\(0, 3\)
      \.map\(\(c: any\) => `\$\{c\.condition\} \(viability: \$\{c\.repurposing_score\}/10\)`\)\.join\('; '\);
    const topRisks  = \(report\?\.ai_analysis\?\.top_risks \|\| \[\]\)\.slice\(0, 3\)\.join\('; '\);
    const systemPrompt =
      `You are an expert medical informatics AI analyzing a drug repurposing research report\.\\n\\n` \+
      `COMPOUND: \$\{mol\}\\n` \+
      `PHOENIX REPURPOSING SCORE: \$\{report\?\.phoenix_score \?\? 'N/A'\}/10\\n` \+
      `TOP REPURPOSING OPPORTUNITIES: \$\{topOpp \|\| 'None identified'\}\\n` \+
      `KEY RISK FACTORS: \$\{topRisks \|\| 'None identified'\}\\n` \+
      `CLINICAL TRIALS ANALYZED: \$\{\(report\?\.clinical_data \|\| \[\]\)\.length\}\\n` \+
      `PATENTS FOUND: \$\{\(report\?\.patent_data \|\| \[\]\)\.length\}\\n` \+
      `PUBLICATIONS ANALYZED: \$\{\(report\?\.literature_data \|\| \[\]\)\.length\}\\n` \+
      `MARKET ANALYSIS: \$\{\(report\?\.market_analysis \|\| \[\]\)\.map\(\(m: any\) => `\$\{m\.condition\} \\\$\$\{m\.market_size_usd_billion\?\.toFixed\(1\)\}B`\)\.slice\(0, 3\)\.join\(', '\)\}\\n\\n` \+
      `Answer questions accurately based on this report data\. Cite specific data points\. ` \+
      `Never hallucinate\. If data is missing, say "Not available in report data\." Keep answers concise\.\`;

    res\.setHeader\('Content-Type', 'text/event-stream'\);
    res\.setHeader\('Cache-Control', 'no-cache'\);
    res\.setHeader\('Connection', 'keep-alive'\);
    res\.flushHeaders\(\);

    try \{
      const groqRes = await fetch\('https://api\.groq\.com/openai/v1/chat/completions', \{
        method: 'POST',
        headers: \{
          'Content-Type': 'application/json',
          'Authorization': `Bearer \$\{GROQ_KEY\}`
        \},
        body: JSON\.stringify\(\{
          model: 'llama-3\.3-70b-versatile',
          messages: \[
            \{ role: 'system', content: systemPrompt \},
            \{ role: 'user', content: message \}
          \],
          stream: true
        \}\),
      \}\);

      if \(!groqRes\.ok\) \{
        const errText = await groqRes\.text\(\);
        res\.write\(`data: \$\{JSON\.stringify\(\{ error: `API error \$\{groqRes\.status\}: \$\{errText\.slice\(0, 200\)\}` \}\)}\\n\\n`\);
        res\.end\(\);
        return;
      \}"""

target_new = r"""  app.post('/api/claude/chat/:id', async (req, res) => {
    const reportId = req.params.id;
    const { message } = req.body;
    const report = reports.get(reportId);
    
    const keys = getGroqKeys();
    if (keys.length === 0) {
      return res.status(500).json({ error: 'GROQ_API_KEYS not configured on the server.' });
    }

    const mol       = report?.molecule || 'Unknown compound';
    const topOpp    = (report?.repurposing_candidates || []).slice(0, 3)
      .map((c: any) => `${c.condition} (viability: ${c.repurposing_score}/10)`).join('; ');
    const topRisks  = (report?.ai_analysis?.top_risks || []).slice(0, 3).join('; ');
    const systemPrompt =
      `You are an expert medical informatics AI analyzing a drug repurposing research report.\n\n` +
      `COMPOUND: ${mol}\n` +
      `PHOENIX REPURPOSING SCORE: ${report?.phoenix_score ?? 'N/A'}/10\n` +
      `TOP REPURPOSING OPPORTUNITIES: ${topOpp || 'None identified'}\n` +
      `KEY RISK FACTORS: ${topRisks || 'None identified'}\n` +
      `CLINICAL TRIALS ANALYZED: ${(report?.clinical_data || []).length}\n` +
      `PATENTS FOUND: ${(report?.patent_data || []).length}\n` +
      `PUBLICATIONS ANALYZED: ${(report?.literature_data || []).length}\n` +
      `MARKET ANALYSIS: ${(report?.market_analysis || []).map((m: any) => `${m.condition} $${m.market_size_usd_billion?.toFixed(1)}B`).slice(0, 3).join(', ')}\n\n` +
      `Answer questions accurately based on this report data. Cite specific data points. ` +
      `Never hallucinate. If data is missing, say "Not available in report data." Keep answers concise.`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      let groqRes = null;
      for (const key of keys) {
        groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            stream: true
          }),
        });
        
        if (groqRes.status === 429 || groqRes.status === 401) {
          console.warn(`[Groq AI] Key failed with status ${groqRes.status}, rotating...`);
          continue;
        }
        break; // Stop if we get a good response or generic error
      }

      if (!groqRes || !groqRes.ok) {
        const errText = groqRes ? await groqRes.text() : 'All keys failed matching.';
        res.write(`data: ${JSON.stringify({ error: `API error ${groqRes?.status}: ${errText.slice(0, 200)}` })}\n\n`);
        res.end();
        return;
      }"""

result = re.sub(target_old, target_new, text)
with open(r"X:\Hackathon\Blueprints\backend\server.ts", "w", encoding="utf-8") as f:
    f.write(result)
print("Done backend/server.ts")
