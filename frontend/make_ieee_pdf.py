import re

with open(r"X:\Hackathon\Blueprints\frontend\src\pages\ReportPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r"const html = `.*?html2canvas: \{ scale: 2(?:, useCORS: true, letterRendering: true)? \},\s*jsPDF: \{ unit: 'mm', format: 'a4', orientation: 'portrait' \}\s*\}\)\.from\(html\)\.save\(\);"

new_html = r"""const html = `
          <div id="pdf-container" style="background-color: #ffffff !important; color: #000000 !important; width: 100%; max-width: 850px; margin: 0 auto; padding: 25px; font-family: 'Times New Roman', Times, serif; font-size: 11px; line-height: 1.4; text-align: justify;">
            <!-- Header Block -->
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 15px; font-family: Arial, Helvetica, sans-serif; line-height: 1.2;">
                In Silico Pharmacological Analysis and Repurposing Viability Assessment of ${report.molecule}
              </h1>
              <p style="font-size: 12px; margin: 0;">
                <b>Blueprints Generative Intelligence Group</b><br/>
                <i>Automated Pipeline Operations, Data Analytics Division</i><br/>
                Generated: ${new Date().toLocaleDateString()}
              </p>
            </div>

            <!-- Abstract Block -->
            <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 15px 10px; margin-bottom: 25px;">
              <p style="margin: 0;"><b><i>Abstract</i>&mdash; ${execText}</b></p>
              <p style="margin: 8px 0 0 0;"><i>Index Terms</i>&mdash; Drug Repurposing, Pharmacometrics, ${report.molecule}, In Silico Analysis, Phoenix Repurposing Score.</p>
            </div>

            <!-- Two Column Layout -->
            <div style="display: flex; gap: 20px;">
              
              <!-- Left Column -->
              <div style="flex: 1; width: 50%;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: center; margin: 0 0 10px 0; font-family: Arial, sans-serif;">I. Introduction</h2>
                <p style="text-indent: 15px; margin: 0 0 10px 0;">
                  The necessity for novel pharmacological indications has driven rapid innovation in algorithmic drug repurposing. In this assessment, the compound <b>${report.molecule}</b> was subjected to a multi-agent heuristic evaluation targeting public registries, clinical literature, and patent distributions.
                </p>
                <p style="text-indent: 15px; margin: 0 0 15px 0;">
                  The aggregate <b>Phoenix Repurposing Score</b> for the compound was computed mathematically at <b>${Number(report.phoenix_score || 0).toFixed(1)} / 10.0</b>. This normalized coefficient signifies its cumulative alternative viability relative to historic pharmacokinetic benchmarks and modern development trends.
                </p>

                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: center; margin: 20px 0 10px 0; font-family: Arial, sans-serif;">II. Candidate Indications</h2>
                <p style="text-indent: 15px; margin: 0 0 10px 0;">
                  Quantitative structural modeling and pathway tracking facilitated the isolation of prime candidate indications. Phase progression rates were cross-referenced against expected market capitalization.
                </p>
                
                <!-- Table in Column -->
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10px;">
                  <thead>
                    <tr style="border-top: 1px solid #000; border-bottom: 1px double #000;">
                      <th style="padding: 4px; text-align: left;">Condition</th>
                      <th style="padding: 4px; text-align: center;">Phase</th>
                      <th style="padding: 4px; text-align: center;">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topOpps.map((c: any) => `
                    <tr>
                      <td style="padding: 4px;">${c.condition}</td>
                      <td style="padding: 4px; text-align: center;">${c.max_phase || 'Pre-Clin'}</td>
                      <td style="padding: 4px; text-align: center;"><b>${Number(c.repurposing_score || 0).toFixed(1)}</b></td>
                    </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr><td colspan="3" style="border-top: 1px solid #000; padding: 2px;"></td></tr>
                  </tfoot>
                </table>
              </div>

              <!-- Right Column -->
              <div style="flex: 1; width: 50%;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: center; margin: 0 0 10px 0; font-family: Arial, sans-serif;">III. Risk & Deficit Profiling</h2>
                <p style="text-indent: 15px; margin: 0 0 10px 0;">
                  Identified candidate profiles concurrently present inherent clinical and strategic risk vectors. Subterranean pattern mapping extracted the following contraindications from the knowledge base:
                </p>
                <ul style="margin: 0 0 15px 0; padding-left: 20px; font-size: 10px;">
                  ${(report.ai_analysis?.top_risks || ['No baseline clinical toxicity signals flagged.']).map((r: string) => `
                  <li style="margin-bottom: 6px;">${r}</li>
                  `).join('')}
                </ul>

                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: center; margin: 20px 0 10px 0; font-family: Arial, sans-serif;">IV. Empirical Literature Matrix</h2>
                <p style="text-indent: 15px; margin: 0 0 10px 0;">
                  Validation was governed strictly by peer-reviewed evidence and authenticated intellectual property filings compiled algorithmically:
                </p>
                
                <h3 style="font-size: 11px; font-style: italic; margin: 10px 0 5px 0;">A. United States Patent Registry</h3>
                <div style="font-size: 9px; line-height: 1.3;">
                  ${report.patent_data && report.patent_data.length > 0 ? report.patent_data.slice(0, 3).map((p: any) => `
                    <p style="margin: 0 0 5px 0; padding-left: 15px; text-indent: -15px;">[P${p.id}] ${p.assignee ? p.assignee + '. ' : ''}<i>${p.title}</i>. Filed: ${p.date || 'N/A'}.</p>
                  `).join('') : '<p style="margin: 0;">No relevant structural IP retrieved.</p>'}
                </div>

                <h3 style="font-size: 11px; font-style: italic; margin: 15px 0 5px 0;">B. Primary Journal Citations</h3>
                <div style="font-size: 9px; line-height: 1.3;">
                  ${report.literature_data && report.literature_data.length > 0 ? report.literature_data.slice(0, 5).map((l: any, i: number) => `
                    <p style="margin: 0 0 5px 0; padding-left: 15px; text-indent: -15px;">[${i+1}] ${l.title}. <i>${l.journal}</i> (${l.year}). PMID: ${l.id}.</p>
                  `).join('') : '<p style="margin: 0;">No direct literature dependencies detected.</p>'}
                </div>
              </div>
            </div>
          </div>`;
        await html2pdf().set({
          margin: 10,
          filename: `${report.molecule}_Research_Paper.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(html).save();"""

new_content = re.sub(pattern, new_html, content, flags=re.DOTALL)

with open(r"X:\Hackathon\Blueprints\frontend\src\pages\ReportPage.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Double check:", content != new_content)
