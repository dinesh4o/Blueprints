const fs = require('fs');
let file = 'X:/Hackathon/Blueprints/backend/server.ts';
let content = fs.readFileSync(file, 'utf8');

// replace only the second occurence of 'import path from \'path\';'
content = content.replace(/import express from 'express';\r?\n\r?\nimport path from 'path';/g, 'import express from \'express\';');
fs.writeFileSync(file, content);

