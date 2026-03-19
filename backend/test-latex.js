import https from 'https';
import fs from 'fs';

const tex = `\\documentclass{article}
\\begin{document}
Hello World! This is a test.
\\end{document}`;

const postData = 'text=' + encodeURIComponent(tex);

const req = https.request({
  hostname: 'latexonline.cc',
  port: 443,
  path: '/compile',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
}, (res) => {
  if (res.statusCode !== 200) {
    console.log('Failed:', res.statusCode);
    res.on('data', d => process.stdout.write(d));
    return;
  }
  const file = fs.createWriteStream("test.pdf");
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download complete.');
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(postData);
req.end();
