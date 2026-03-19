import https from 'https';

function escapeTex(text: string) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\_/g, '\\_')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\~/g, '\\textasciitilde{}')
    .replace(/\#/g, '\\#')
    .replace(/\$/g, '\\$')
    .replace(/\%/g, '\\%')
    .replace(/\&/g, '\\&');
}

export async function generateReportLaTeX(report: any): Promise<Buffer> {
  const molName = escapeTex(report.molecule || 'Unknown Molecule');
  const phoenixScore = report.phoenix_score != null ? report.phoenix_score.toFixed(1) : 'N/A';
  
  // Abstract
  let abstractText = report.ai_analysis?.reasoning ? escapeTex(report.ai_analysis.reasoning) : '\\textit{No synthesis data available.}';
  // truncate abstract to fit nicely if it's too long
  if (abstractText.length > 2000) {
     abstractText = abstractText.slice(0, 2000) + '...';
  }

  // Market
  let marketRows = '';
  if (report.repurposing_candidates && report.repurposing_candidates.length > 0) {
    marketRows = report.repurposing_candidates.slice(0, 5).map((c: any) => {
      const condition = escapeTex(c.condition);
      const phase = escapeTex(c.max_phase.replace('_', ' '));
      const size = c.market_size_usd_billion ? `\\$${c.market_size_usd_billion.toFixed(1)}B` : 'N/A';
      const score = c.repurposing_score ? c.repurposing_score.toFixed(1) : 'N/A';
      return `${condition} & ${phase} & ${size} & ${score} \\\\`;
    }).join('\n    ');
  }

  // Clinical Trials
  let clinicalSection = '';
  if (report.clinical_data && report.clinical_data.length > 0) {
    clinicalSection = report.clinical_data.slice(0, 5).map((t: any) => {
       return `\\item \\textbf{${escapeTex(t.nct_id || 'Unknown ID')}} (${escapeTex(t.phase || 'N/A')}): ${escapeTex(t.title || 'Untitled')}. Status: \\textit{${escapeTex(t.status || 'Unknown')}}`;
    }).join('\n');
    clinicalSection = `\\begin{itemize}\n${clinicalSection}\n\\end{itemize}`;
  } else {
    clinicalSection = 'No direct clinical trials found for this compound.';
  }

  // Patents
  let patentSection = '';
  if (report.patent_data && report.patent_data.length > 0) {
    patentSection = report.patent_data.slice(0, 3).map((p: any) => {
       return `\\item \\textbf{${escapeTex(p.id)}}: ${escapeTex(p.title)}`;
    }).join('\n');
    patentSection = `\\begin{itemize}\n${patentSection}\n\\end{itemize}`;
  } else {
    patentSection = 'No major linked patents retrieved, suggesting a potentially open intellectual property landscape.';
  }

  const texDoc = `
\\PassOptionsToPackage{unicode}{hyperref}
\\PassOptionsToPackage{hyphens}{url}
\\documentclass[10pt,a4paper]{article}
\\usepackage{amsmath,amssymb}
\\usepackage{lmodern}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{textcomp}
\\usepackage{microtype}
\\usepackage{parskip}
\\usepackage{xcolor}
\\usepackage{longtable,booktabs,array}
\\usepackage{multirow}
\\usepackage{calc}
\\usepackage{etoolbox}
\\usepackage{graphicx}
\\usepackage[margin=1.1in]{geometry}
\\usepackage{hyperref}
\\hypersetup{hidelinks,pdfcreator={LaTeX via pandoc}}

\\makeatletter
\\patchcmd\\longtable{\\par}{\\if@noskipsec\\mbox{}\\fi\\par}{}{}
\\makeatother

\\title{\\vspace{-2cm}\\large \\textit{Communication} \\\\ \\vspace{0.4cm} \\LARGE \\textbf{Advancements in Drug Repurposing: In-Silico Analysis of ${molName}}}
\\author{\\textbf{Phoenix Blueprint Subsystem} \\\\ \\textit{AI Molecular Laboratory, Blueprints Platform}}
\\date{}

\\begin{document}

\\begin{longtable}[]{@{} p{0.33\\linewidth} p{0.33\\linewidth} p{0.33\\linewidth} @{}}
\\toprule()
\\multirow{2}{*}{\\begin{minipage}[b]{\\linewidth}\\raggedright \\textbf{Blueprints Platform} \\end{minipage}} & \\begin{minipage}[b]{\\linewidth}\\centering \\textit{AI Research} \\end{minipage} &
\\multirow{2}{*}{\\begin{minipage}[b]{\\linewidth}\\raggedleft \\textbf{Molecular Sciences} \\end{minipage}} \\\\
& \\begin{minipage}[b]{\\linewidth}\\centering \\textbf{\\textit{Journal of Repurposing}} \\end{minipage} \\\\
\\midrule()
\\endhead
\\bottomrule()
\\end{longtable}

\\maketitle

\\begin{quote}
\\textbf{Abstract:} ${abstractText}

\\vspace{0.5cm}
\\textbf{Keywords:} ${molName}; drug repurposing; Phoenix Score; computational prediction
\\end{quote}

\\vspace{0.5cm}

\\section{1. Introduction}
A drug candidate discovered in the research phase has an approximately 10\\% likelihood of gaining regulatory approval following clinical trials. This is partly due to the difficulty in accurately predicting the efficacy and safety of drugs in humans from non-clinical tests. Drug repurposing, which involves utilizing already approved drugs or clinically developed compounds, has been widely practiced to mitigate these risks. 

This study aimed at uncovering recent trends in drug repurposing approaches and evaluating the potential of \\textbf{${molName}}. Utilizing the Phoenix Scoring Framework, we generated an objective viability score to quantify the compound's likelihood of successful redeployment into novel therapeutic indications.

\\section{2. Results}
\\subsection{2.1. Market Intelligence and Opportunities}
The repurposing opportunities for ${molName} were identified by traversing disease networks. The following table outlines the top repurposing opportunities, prioritized by clinical phase proximity and addressable market size.

\\vspace{0.4cm}
\\begin{longtable}[]{@{}
  >{\\raggedright\\arraybackslash}p{0.4\\linewidth}
  >{\\raggedright\\arraybackslash}p{0.2\\linewidth}
  >{\\raggedright\\arraybackslash}p{0.2\\linewidth}
  >{\\raggedright\\arraybackslash}p{0.1\\linewidth}@{}}
\\toprule()
\\textbf{Indication} & \\textbf{Max Phase} & \\textbf{TAM} & \\textbf{Score} \\\\
\\midrule()
\\endhead
${marketRows ? marketRows : 'No reliable mapping found & --- & --- & --- \\\\'}
\\bottomrule()
\\end{longtable}
\\vspace{0.4cm}

\\subsection{2.2. Clinical Trial Evidence}
To accurately estimate the efficacy and safety of ${molName}, extrapolation from clinical trials to novel applications is critically required. Analysis of clinical trial registries highlights the following studies which underpin our target predictions:
${clinicalSection}

\\subsection{2.3. Intellectual Property Landscape}
Drug repurposing relies heavily on evaluating the patent landscape to formulate a clear commercialization strategy. The major linked patents retrieved for ${molName} are:
${patentSection}

\\section{3. Discussion}
Based on the aggregated metrics natively processed via the pipeline, \\textbf{${molName}} exhibits a \\textbf{Phoenix Score of ${phoenixScore}/10}. 

This highlights that drug repurposing in this compound is not limited to the conventional searches but could be aimed at alternative development concepts. It is expected that sophisticated drug repurposing approaches combined with algorithmic evaluations will accelerate the translation into clinical trials.

\\vspace{1cm}
\\noindent
\\textbf{Disclaimer/Publisher's Note:} The statements, opinions and data contained in all publications are generated natively via the AI synthesis engine and are subject to active verification. Not for clinical diagnostic use.

\\end{document}
  `;

  try {
    const formData = new FormData();
    formData.append('filename[]', 'document.tex');
    formData.append('filecontents[]', new Blob([texDoc.trim()]), 'document.tex');
    formData.append('engine', 'pdflatex');
    formData.append('return', 'pdf');

    const response = await fetch('https://texlive.net/cgi-bin/latexcgi', {
      method: 'POST',
      body: formData,
    });

    const isPdf = response.headers.get('content-type')?.includes('application/pdf');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!response.ok || !isPdf) {
      throw new Error(`Compilation Error. Status: ${response.status}. Output: ${buffer.toString('utf8').slice(0, 1000)}`);
    }

    return buffer;
  } catch (err: any) {
    throw new Error(`Failed to compile LaTeX: ${err.message}`);
  }
}
