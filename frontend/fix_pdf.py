import re

with open(r"X:\Hackathon\Blueprints\frontend\src\pages\ReportPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r"const html = `.*?html2canvas: \{ scale: 2, useCORS: true, letterRendering: true \},\s*jsPDF: \{ unit: 'mm', format: 'a4', orientation: 'portrait' \}\s*\}\)\.from\(html\)\.save\(\);"

new_html = r"""const html = `
          <div style="font-family: 'Times New Roman', Times, serif; color: #000; width: 100%; max-width: 800px; margin: 0 auto; background: white; padding: 20px 40px; text-align: justify; line-height: 1.6;">
            <!-- Academic Heading -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 10px;">Automated Pharmacological Analysis and Repurposing Viability of ${report.molecule}</h1>
              <p style="font-size: 14px; margin: 0;">
                <b>Blueprints Research Engine</b><br/>
                <i>In silico Drug Repurposing Group</i><br/>
                Date: ${new Date().toLocaleDateString()}
              </p>
            </div>

            <!-- Abstract -->
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 13px; text-transform: uppercase; text-align: center; font-weight: bold; margin: 0 0 10px;">Abstract</h2>
              <p style="font-size: 12px; margin: 0 30px;">${execText}</p>
            </div>

            <hr style="border: 0; border-top: 1px solid #000; margin: 20px 0;" />

            <!-- Main Body -->
            <h2 style="font-size: 14px; font-weight: bold; margin-top: 20px; border-bottom: 1px solid #000; display: inline-block;">1. Introduction & Viability Profile</h2>
            <p style="font-size: 12px; margin-top: 10px;">The compound ${report.molecule} was evaluated using a multi-agent framework across clinical, patent, and literature databases. The aggregate Phoenix Repurposing Score was calculated at <b>${Number(report.phoenix_score || 0).toFixed(1)} / 10.0</b>. This metric reflects its overall viability for alternative indications based on historical clinical activity, mechanistic data, and market conditions.</p>

            <h2 style="font-size: 14px; font-weight: bold; margin-top: 20px; border-bottom: 1px solid #000; display: inline-block;">2. Candidate Indications</h2>
            <p style="font-size: 12px; margin-top: 10px;">Quantitative analysis identified the following primary candidate indications:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px;">
              <thead>
                <tr style="border-top: 2px solid #000; border-bottom: 1px solid #000;">
                  <th style="text-align: left; padding: 5px;">Indication / Target</th>
                  <th style="text-align: center; padding: 5px;">Development Phase</th>
                  <th style="text-align: center; padding: 5px;">Viability Score</th>
                  <th style="text-align: right; padding: 5px;">Est. Market Value</th>
                </tr>
              </thead>
              <tbody>
                ${topOpps.map((c: any) => `
                <tr>
                  <td style="padding: 5px;">${c.condition}</td>
                  <td style="text-align: center; padding: 5px;">${c.max_phase || 'Pre-Clinical'}</td>
                  <td style="text-align: center; padding: 5px;">${Number(c.repurposing_score || 0).toFixed(1)}</td>
                  <td style="text-align: right; padding: 5px;">${currency === 'INR' ? 'INR ' + (Number(c.market_size_usd_billion || 0) * 83.5).toFixed(1) + 'B' : 'USD ' + Number(c.market_size_usd_billion || 0).toFixed(1) + 'B'}</td>
                </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr><td colspan="4" style="border-top: 2px solid #000;"></td></tr>
              </tfoot>
            </table>

            <h2 style="font-size: 14px; font-weight: bold; margin-top: 20px; border-bottom: 1px solid #000; display: inline-block;">3. Risk Assessment</h2>
            <ul style="font-size: 12px; margin-top: 10px; padding-left: 20px;">
              ${(report.ai_analysis?.top_risks || ['No specific risk factors identified.']).map((r: string) => `
              <li style="margin-bottom: 5px;">${r}</li>
              `).join('')}
            </ul>

            <h2 style="font-size: 14px; font-weight: bold; margin-top: 20px; border-bottom: 1px solid #000; display: inline-block;">4. Supporting Evidence</h2>
            
            <h3 style="font-size: 13px; font-weight: bold; margin-top: 15px; font-style: italic;">4.1 Relevant Patent Filings (USPTO)</h3>
            <div style="font-size: 11px; margin-bottom: 15px;">
              ${report.patent_data && report.patent_data.length > 0 ? report.patent_data.slice(0, 4).map((p: any) => `
                <p style="margin-bottom: 6px; text-indent: -15px; padding-left: 15px;"><b>[${p.id}]</b> ${p.assignee ? p.assignee + '. ' : ''}${p.title}. <i>Filed/Granted: ${p.date || 'N/A'}</i>.</p>
              `).join('') : '<p>No specific active patents highlighted in the primary focus area.</p>'}
            </div>

            <h3 style="font-size: 13px; font-weight: bold; margin-top: 15px; font-style: italic;">4.2 Selected Literature (PubMed)</h3>
            <div style="font-size: 11px;">
              ${report.literature_data && report.literature_data.length > 0 ? report.literature_data.slice(0, 6).map((l: any) => `
                <p style="margin-bottom: 6px; text-indent: -15px; padding-left: 15px;">${l.title}. <i>${l.journal}</i> (${l.year}). PMID: ${l.id}.</p>
              `).join('') : '<p>No primary mechanism papers attached.</p>'}
            </div>
            
            <div style="margin-top: 40px; text-align: center; font-size: 10px; border-top: 1px solid #000; padding-top: 10px;">
               <i>Automated computational research asset. Generated without manual verification. Not intended for direct clinical application.</i>
            </div>
          </div>`;
        await html2pdf().set({
          margin: 15,
          filename: `${report.molecule}_Research_Paper.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(html).save();"""

new_content = re.sub(pattern, new_html, content, flags=re.DOTALL)

with open(r"X:\Hackathon\Blueprints\frontend\src\pages\ReportPage.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Replaced:", content != new_content)
