import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { TemplateOptions } from '../../utils/types';


/**
 * @function handleRestAPI
 * Handles the creation of a REST API project using Abimongo.
 *
 * @param {string} projectName - The name of the project.
 * @param {TemplateOptions} options - Options for the template.
 * @returns {Promise<void>} - A promise that resolves when the project is created.
 *
 * @example
 * handleRestAPI('my-rest-api', { useTypeScript: true, useAbimongo: true, includeUtils: false });
 *  
 */
export async function handleRestAPI(
  projectName: string,
  options: TemplateOptions
) {
  const ext = options.useTypeScript ? 'ts' : 'js';
  const rootDir = path.resolve(process.cwd(), projectName);
  const srcDir = path.join(rootDir, 'server');
  const README_FILE = path.join(rootDir, 'README.md');

  console.log(chalk.cyan(`\n🚀 Creating REST API project in ${rootDir}...\n`));
  fs.ensureDirSync(srcDir);

  // Step 1: Write entry file
  const entryFileContent = `
import express from 'express';
import cors from 'cors';
${options.useAbimongo ? `import { AbimongoClient } from 'abimongo_core';` : ''}
${options.includeUtils ? `import { someHelper } from 'abimongo_utils'; // Example usage` : ''}

const app = express();
app.use(cors());
app.use(express.json());

${options.useAbimongo ? `
const client = new AbimongoClient({ uri: process.env.MONGO_URI });
await client.connect();
` : ''}

app.get('/', (_, res) => {
  res.send('REST API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;

  fs.writeFileSync(path.join(srcDir, `index.${ext}`), entryFileContent.trimStart());

  // Step 2: Write .env
  fs.writeFileSync(path.join(srcDir, '.env'), `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${projectName}`);

  // Step 3: Init & install dependencies
  execSync('npm init -y', { cwd: srcDir, stdio: 'inherit' });

  execSync(
    `npm install express cors dotenv${options.useAbimongo ?
      ' abimongo_core' : ''}${options.includeUtils ? ' abimongo_utils' : ''}`,
    { cwd: srcDir, stdio: 'inherit' }
  );

  // Add README file
  const readmeContent = `
# ${projectName}
This project was scaffolded using the Abimongo CLI.
## Getting Started
1. npm install  
2. npm run dev
3. Read the documentation for Abimongo and Abimongo_Core to understand how to use them (abimongo.dev)['https://www.abimongo.dev'].
4. Ensure you send an x-tenant-id header with every request if using multi-tenancy. (This is optional)
5. Customize your REST API as needed.

## Environment Variables  

Create a .env file in the root directory with the following variables:

\`\`\`

MONGO_URI=mongodb://localhost:27017/${projectName}
PORT=5000

\`\`\`

## License

This project is licensed under the Apache-2.0 License.
`;
  fs.writeFileSync(README_FILE, readmeContent.trimStart());

  if (options.useTypeScript) {
    execSync(`npm install -D typescript ts-node @types/express @types/node`, { cwd: srcDir, stdio: 'inherit' });


    fs.writeFileSync(path.join(srcDir, 'tsconfig.json'), JSON.stringify({
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
    }, null, 2));
  }

  console.log(chalk.green('\n✅ REST API project setup complete!'));
  console.log(chalk.green(`✔ REST API project "${projectName}" created successfully.`));
  console.log(chalk.blueBright(`👉 cd ${projectName}`));
  console.log(chalk.blueBright(`👉 npm run dev`));
  console.log(chalk.blueBright(`👉 Customize your Abimongo_Core-powered REST API from there.`));
}


