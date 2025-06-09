// src/cli/commands/handlers/handleMERNStack.ts
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { TemplateOptions } from '../../utils/types';

/**
 * Handles the creation of a MERN stack project with optional TypeScript and Abimongo_Core integration.
 *
 * @param {string} projectName - The name of the project.
 * @param {TemplateOptions} options - Options for the template.
 */
export async function handleMERNStack(projectName: string, options: TemplateOptions) {
  const { useTypeScript, useAbimongo, includeUtils } = options;
  const ext = useTypeScript ? 'ts' : 'js';
  const rootDir = path.resolve(process.cwd(), projectName);
  const clientDir = path.join(rootDir, 'client');
  const serverDir = path.join(rootDir, 'server');

  console.log(chalk.cyan(`\n📦 Creating MERN stack project in ${rootDir}...\n`));

  // 1. Create base directories
  fs.ensureDirSync(clientDir);
  fs.ensureDirSync(serverDir);

  // 2. Setup React frontend
  console.log(chalk.yellow('⚛️  Setting up React frontend...'));
  const reactTemplate = useTypeScript ? '--template typescript' : '';
  execSync(`npx create-react-app ${clientDir} ${reactTemplate}`, { stdio: 'inherit' });

  // 3. Setup Express backend
  console.log(chalk.yellow('🚀 Setting up Express backend...'));

  const expressIndex = `import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
${useAbimongo ? `import { AbimongoClient } from 'abimongo_core';` : ''}

config();
const app = express();
app.use(cors());
app.use(express.json());

${useAbimongo ? `const client = new AbimongoClient({ uri: process.env.MONGO_URI });\nawait client.connect();\n` : ''}

app.get('/', (_, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;

  fs.writeFileSync(path.join(serverDir, `index.${ext}`), expressIndex);

  // 4. Abimongo_Core configuration file
  if (useAbimongo) {
    const abimongoConfig = useTypeScript
      ? `import { AbimongoClient } from 'abimongo_core';

export const client = new AbimongoClient({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}'
});

export async function initAbimongo() {
  await client.connect();
}
`
      : `const { AbimongoClient } = require('abimongo_core');

const client = new AbimongoClient({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}'
});

async function initAbimongo() {
  await client.connect();
}

module.exports = { client, initAbimongo };
`;

    fs.writeFileSync(path.join(serverDir, `abimongo.config.${ext}`), abimongoConfig);
  }

  // 5. Environment variables
  fs.writeFileSync(
    path.join(serverDir, '.env'),
    `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${projectName}`
  );

  // 6. Backend package.json and dependencies
  execSync(`npm init -y`, { cwd: serverDir, stdio: 'inherit' });

  execSync(`npm install express cors dotenv${useAbimongo ? ' abimongo_core' : ''}`, {
    cwd: serverDir,
    stdio: 'inherit'
  });

  if (useTypeScript) {
    execSync(`npm install -D typescript ts-node @types/node @types/express`, {
      cwd: serverDir,
      stdio: 'inherit'
    });

    fs.writeFileSync(
      path.join(serverDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            rootDir: './',
            outDir: './dist',
            esModuleInterop: true,
            forceConsistentCasingInFileNames: true,
            strict: true,
            skipLibCheck: true
          }
        },
        null,
        2
      )
    );
  }

  // 7. Optional utils file
  if (includeUtils) {
    const utilsDir = path.join(serverDir, 'utils');
    fs.ensureDirSync(utilsDir);

    const utilCode =
      ext === 'ts'
        ? `export function formatResponse(data: any) {
  return { success: true, data };
}`
        : `function formatResponse(data) {
  return { success: true, data };
}
module.exports = { formatResponse };`;

    fs.writeFileSync(path.join(utilsDir, `helper.${ext}`), utilCode);
  }

  // 8. Final message
  console.log(chalk.green('\n✅ MERN Stack project setup complete!\n'));
}
