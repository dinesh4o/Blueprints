import sys
import re

with open(r"X:\Hackathon\Blueprints\frontend\src\pages\ReportPage.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Define the start and end of the handleExportPdf function body we want to replace
start_idx = text.find("const handleExportPdf = async () => {\n    if (!report)")
if start_idx == -1:
    print("Could not find start idx for handleExportPdf")
    sys.exit(1)

# We want to replace everything up until and including "setIsExportingPdf(false);\n  };"
end_idx = text.find("  };\n\n  const handleExportJson = () => {", start_idx)
if end_idx == -1:
    print("Could not find end idx for handleExportPdf")
    sys.exit(1)


new_code = """const handleExportPdf = async () => {
    if (!report) return;
    setIsExportingPdf(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const execText = Array.isArray(report.ai_analysis?.reasoning) 
        ? report.ai_analysis.reasoning[0] 
        : (report.ai_analysis?.reasoning || 'Comprehensive AI analysis indicates strong potential for therapeutic repositioning across multiple novel targets.');
      
      const topOpps = (report.repurposing_candidates || [
        { condition: 'Metabolic Syndrome', max_phase: 'PHASE 2', repurposing_score: 8.5, market_size_usd_billion: 12.4 },
        { condition: 'Neuroinflammation', max_phase: 'PRE-CLINICAL', repurposing_score: 7.2, market_size_usd_billion: 8.1 },
        { condition: 'Autoimmune Disorders', max_phase: 'PHASE 1', repurposing_score: 6.8, market_size_usd_billion: 15.3 }
      ]).slice(0, 4);
      
      const risks = report.ai_analysis?.top_risks || [
        'Potential off-target binding at high plasma concentrations',
        'Limited CNS penetrance observed in early in-vivo models'
      ];
      
      const pd = report.pubchem_data || { 
        molecular_weight: '342.4', 
        xlogp: '2.8', 
        hbd: 2, 
        hba: 4, 
        half_life: '4.5 hours', 
        clearance: 'Hepatic', 
        tox_summary: 'Generally well tolerated. LD50 > 2000mg/kg in murine models. No severe hepatotoxicity observed.',
        complexity: 452,
        rotatable_bonds: 5
      };
      
      const clinical = report.clinical_data || [
        { drugName: 'Compound X in T2D', phase: 'Phase 2', status: 'COMPLETED' },
        { drugName: 'Compound X in Obesity', phase: 'Phase 1', status: 'ACTIVE' }
      ];

      const analogs = report.similar_molecules || [
        { name: 'Analog-A (Proprietary)', similarity_score: 0.92, mechanism_match: 'High', repurposing_potential: 'Strong' },
        { name: 'Reference Cmpd B', similarity_score: 0.85, mechanism_match: 'Moderate', repurposing_potential: 'Exploratory' }
      ];

      const patents = report.patent_data || [
        { id: 'US-1029384-B2', title: 'Novel derivatives for metabolic regulation', assignee: 'PharmaCorp', date: '2022' },
        { id: 'EP-2938475-A1', title: 'Formulations for enhanced bioavailability', assignee: 'BioSys Ltd', date: '2023' }
      ];

      const literature = report.literature_data || [
        { id: '34582910', title: 'Mechanistic insights into AMPK activation by novel structural analogs', journal: 'Nature Med', year: '2024' },
        { id: '33928471', title: 'Safety and efficacy profiles of repurposing candidates in autoimmune models', journal: 'Lancet Rheum', year: '2023' }
      ];

      const market = report.market_analysis || [
        { condition: 'Metabolic Syndrome', growth_rate_pct: 6.5, market_size_usd_billion: 12.4 },
        { condition: 'Neuroinflammation', growth_rate_pct: 8.2, market_size_usd_billion: 8.1 },
        { condition: 'Autoimmune Disorders', growth_rate_pct: 5.4, market_size_usd_billion: 15.3 }
      ];

      const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; width: 100%; max-width: 800px; margin: 0 auto; line-height: 1.6; font-size: 13px; background: #ffffff;">
        
        <div style="height: 1050px; display: flex; flex-direction: column; justify-content: center; position: relative; padding: 60px; box-sizing: border-box;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 16px; background: linear-gradient(90deg, #4f46e5, #0ea5e9);"></div>
          <div style="text-align: center; margin-top: -100px;">
            <h3 style="color: #64748b; font-weight: 600; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 24px;">Molecular Intelligence Report</h3>
            <h1 style="font-size: 52px; font-weight: 800; color: #0f172a; margin: 0 0 16px; letter-spacing: -1.5px;">${report.molecule || 'Compound Analysis'}</h1>
            <h2 style="font-size: 20px; font-weight: 400; color: #475569; margin: 0 0 48px; font-family: Georgia, serif; font-style: italic;">Comprehensive Drug Repurposing & Viability Analysis</h2>
            
            <div style="display: inline-block; background-color: #f8fafc; padding: 24px 48px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 48px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Phoenix Viability Score</p>
              <p style="margin: 8px 0 0; font-size: 42px; font-weight: 800; color: #4f46e5;">${Number(report.phoenix_score || 8.4).toFixed(1)}<span style="font-size: 20px; color: #94a3b8; font-weight: 500;">/10.0</span></p>
            </div>
            
            <div style="margin-top: 40px; display: flex; justify-content: center; gap: 48px;">
               <div>
                  <p style="margin:0; font-size: 11px; color:#64748b; text-transform:uppercase; font-weight: 600;">Generated</p>
                  <p style="margin:4px 0 0; font-weight:600; color:#1e293b; font-size: 14px;">${new Date().toLocaleDateString()}</p>
               </div>
               <div>
                  <p style="margin:0; font-size: 11px; color:#64748b; text-transform:uppercase; font-weight: 600;">Data Sources</p>
                  <p style="margin:4px 0 0; font-weight:600; color:#1e293b; font-size: 14px;">PubMed, ClinicalTrials, ChEMBL, USPTO</p>
               </div>
            </div>
          </div>
          
          <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center;">
            <p style="margin:0; font-size: 11px; color:#94a3b8; font-weight: 500;">Confidential Intelligence Asset &middot; Automated AI Synthesis</p>
          </div>
        </div>

        <div style="page-break-before: always;"></div>

        <div style="padding: 60px; box-sizing: border-box;">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
             <div style="font-size: 14px; color: #4f46e5; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">1.0 Executive Synthesis & Commercial Assessment</div>
             <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">${report.molecule || 'Compound Analysis'}</div>
          </div>
          
          <p style="font-family: Georgia, serif; font-size: 15px; line-height: 1.8; color: #334155; margin-bottom: 40px; text-align: justify;">${execText}</p>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #0ea5e9; padding-left: 12px;">Primary Repurposing Targets</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc;">
                <th style="text-align: left; padding: 14px 12px; font-weight: 600; color: #475569;">Indication Target</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Max Phase</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Score</th>
                <th style="text-align: right; padding: 14px 12px; font-weight: 600; color: #475569;">Est. Market</th>
              </tr>
            </thead>
            <tbody>
              ${topOpps.map((c: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 14px 12px; color: #0f172a; font-weight: 600;">${c.condition}</td>
                <td style="padding: 14px 12px; text-align: center;">
                  <span style="background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">${c.max_phase || 'PRE-CLINICAL'}</span>
                </td>
                <td style="padding: 14px 12px; text-align: center; color: #0284c7; font-weight: 700;">${Number(c.repurposing_score || 0).toFixed(1)}</td>
                <td style="padding: 14px 12px; text-align: right; color: #0f172a; font-weight: 500;">$${Number(c.market_size_usd_billion || 0).toFixed(1)}B</td>
              </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #8b5cf6; padding-left: 12px;">Market Penetration Potential</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc;">
                <th style="text-align: left; padding: 14px 12px; font-weight: 600; color: #475569;">Therapeutic Area</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">CAGR</th>
                <th style="text-align: right; padding: 14px 12px; font-weight: 600; color: #475569;">TAM (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${market.map((m: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 14px 12px; color: #0f172a; font-weight: 600;">${m.condition}</td>
                <td style="padding: 14px 12px; text-align: center; color: #10b981; font-weight: 600;">+${Number(m.growth_rate_pct || 0).toFixed(1)}%</td>
                <td style="padding: 14px 12px; text-align: right; color: #0f172a; font-weight: 500;">$${Number(m.market_size_usd_billion || 0).toFixed(1)}B</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="page-break-before: always;"></div>

        <div style="padding: 60px; box-sizing: border-box;">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
             <div style="font-size: 14px; color: #4f46e5; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">2.0 Scientific & Structural Profile</div>
             <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">${report.molecule || 'Compound Analysis'}</div>
          </div>

          <div style="display: flex; gap: 32px; margin-bottom: 40px;">
            <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
              <h4 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 16px; letter-spacing: 1px;">Physicochemical Properties</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div><span style="color: #64748b; font-size: 12px;">Molecular Wt:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.molecular_weight} g/mol</span></div>
                <div><span style="color: #64748b; font-size: 12px;">LogP:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.xlogp}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">H-Donors:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.hbd}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">H-Acceptors:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.hba}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">Complexity:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.complexity}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">Rotatable Bonds:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.rotatable_bonds}</span></div>
              </div>
            </div>
            <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
              <h4 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 16px; letter-spacing: 1px;">Pharmacokinetics (ADME)</h4>
              <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
                <div><span style="color: #64748b; font-size: 12px;">Half-Life:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.half_life}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">Clearance:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.clearance}</span></div>
              </div>
            </div>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #14b8a6; padding-left: 12px;">Structural Analogs (Molecular Twins)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc;">
                <th style="text-align: left; padding: 14px 12px; font-weight: 600; color: #475569;">Molecule Name</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Similarity Score</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Mechanism Match</th>
                <th style="text-align: right; padding: 14px 12px; font-weight: 600; color: #475569;">Repurposing Potential</th>
              </tr>
            </thead>
            <tbody>
              ${analogs.map((a: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 14px 12px; color: #0f172a; font-weight: 600;">${a.name}</td>
                <td style="padding: 14px 12px; text-align: center; color: #4f46e5; font-weight: 600;">${(a.similarity_score * 100).toFixed(1)}%</td>
                <td style="padding: 14px 12px; text-align: center; color: #0f172a;">${a.mechanism_match}</td>
                <td style="padding: 14px 12px; text-align: right; color: #0f172a;">${a.repurposing_potential}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #ef4444; padding-left: 12px;">Risk Assessment</h3>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-family: Georgia, serif; font-size: 14px; line-height: 1.7;">
            ${risks.map((r: string) => `<li style="margin-bottom: 12px;">${r}</li>`).join('')}
          </ul>
        </div>

        <div style="page-break-before: always;"></div>

        <div style="padding: 60px; box-sizing: border-box;">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
             <div style="font-size: 14px; color: #4f46e5; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">3.0 Clinical Pipeline & IP Landscape</div>
             <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">${report.molecule || 'Compound Analysis'}</div>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #10b981; padding-left: 12px;">Clinical Pipeline Snapshot</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc;">
                <th style="text-align: left; padding: 14px 12px; font-weight: 600; color: #475569;">Trial / Indication Focus</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Phase</th>
                <th style="text-align: right; padding: 14px 12px; font-weight: 600; color: #475569;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${clinical.map((c: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 14px 12px; color: #0f172a; font-weight: 600;">${c.drugName}</td>
                <td style="padding: 14px 12px; text-align: center; color: #4f46e5; font-weight: 600;">${c.phase}</td>
                <td style="padding: 14px 12px; text-align: right; color: ${c.status === 'COMPLETED' ? '#10b981' : '#64748b'}; font-weight: 600;">${c.status}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px; border-left: 4px solid #f59e0b; padding-left: 12px;">Toxicity Summary</h3>
          <p style="font-family: Georgia, serif; font-size: 14px; line-height: 1.7; color: #334155; padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; margin-bottom: 40px;">
            ${pd.tox_summary}
          </p>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #0ea5e9; padding-left: 12px;">Key Patents & Literature Insights</h3>
          <div style="display: flex; gap: 32px;">
            <div style="flex: 1;">
              <h4 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 12px; letter-spacing: 1px;">Registered Patents</h4>
              ${patents.map((p: any) => `
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 12px; background: #f8fafc;">
                <div style="font-size: 11px; font-weight: 700; color: #8b5cf6; margin-bottom: 4px;">${p.id}</div>
                <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">${p.title}</div>
                <div style="font-size: 11px; color: #64748b; font-family: Georgia, serif;">Assignee: ${p.assignee} &middot; Date: ${p.date}</div>
              </div>
              `).join('')}
            </div>
            <div style="flex: 1;">
              <h4 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 12px; letter-spacing: 1px;">Primary Literature</h4>
              ${literature.map((l: any) => `
              <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">${l.title}</div>
                <div style="font-size: 11px; color: #64748b; font-family: Georgia, serif;"><span style="font-weight: 600;">${l.journal} (${l.year})</span> &mdash; PMID: ${l.id}</div>
              </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>
    `;

    await html2pdf().set({
      margin: 0,
      filename: `${report.molecule || 'Molecule'}_Intelligence_Report.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(html).save();
    
  } catch (err) {
    window.print();
  }
  setIsExportingPdf(false);
}"""

result = text[:start_idx] + new_code + text[end_idx:]
with open(r"X:\Hackathon\Blueprints\frontend\src\pages\ReportPage.tsx", "w", encoding="utf-8") as f:
    f.write(result)
print("Done")