const texDoc = `
\\documentclass{article}
\\begin{document}
Hello World Node 22 Fetch FormData API test 3
\\end{document}
`;

async function test() {
  const formData = new FormData();
  formData.append('filename[]', 'document.tex');
  formData.append('filecontents[]', new Blob([texDoc.trim()]), 'document.tex');
  formData.append('engine', 'pdflatex');
  formData.append('return', 'pdf');

  try {
    const response = await fetch('https://texlive.net/cgi-bin/latexcgi', {
      method: 'POST',
      body: formData,
    });
    
    const isPdf = response.headers.get('content-type')?.includes('application/pdf');
    const buffer = Buffer.from(await response.arrayBuffer());
    
    if (!response.ok || !isPdf) {
        console.log('Failed:', response.status, buffer.toString('utf8').slice(0, 500));
    } else {
        console.log('Success!', buffer.byteLength, 'bytes, isPdf:', isPdf);
    }
  } catch (e) {
    console.error(e);
  }
}

test();
