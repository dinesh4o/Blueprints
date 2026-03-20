const fs = require("fs");
let c = fs.readFileSync("X:/Hackathon/Blueprints/backend/server.ts", "utf-8");
c = c.replace("import authRoutes from './src/routes/auth';", "import authRoutes from './src/routes/auth';\nimport communityRoutes from './src/routes/community';");
c = c.replace("app.use('/api/auth', authRoutes);", "app.use('/api/auth', authRoutes);\n  app.use('/api/community', communityRoutes);");
fs.writeFileSync("X:/Hackathon/Blueprints/backend/server.ts", c);
console.log("Fixed community routes in server.ts");
