import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { TemplateOptions } from '../../utils/types';

/**
 * Handles the creation of a Next.js application with optional Abimongo integration.
 *
 * @param {string} projectName - The name of the project.
 * @param {TemplateOptions} options - Options for the template.
 */
export async function handleNextApp(projectName: string, options: TemplateOptions) {
  const { useTypeScript, useAbimongo, includeUtils } = options;
  const ext = useTypeScript ? 'ts' : 'js';
  const rootDir = path.resolve(process.cwd(), projectName);

  console.log(chalk.cyan(`\n⚙️ Creating Next.js app in ${rootDir}...\n`));

  // 1. Create Next.js app
  const createCommand = `npx create-next-app@latest ${projectName} ${useTypeScript ? '--typescript' : ''} --no-tailwind --eslint`;
  execSync(createCommand, { stdio: 'inherit' });

  const pagesDir = path.join(rootDir, 'pages');
  const apiDir = path.join(pagesDir, 'api');
  const configDir = path.join(rootDir, 'lib');

  fs.ensureDirSync(apiDir);
  fs.ensureDirSync(configDir);

  // 2. API Route Example with Abimongo_Core if enabled
  const apiHandler = useTypeScript
    ? `import type { NextApiRequest, NextApiResponse } from 'next';
${useAbimongo ? `import { initAbimongo } from '../../lib/abimongo.config';` : ''}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  ${useAbimongo ? 'await initAbimongo();' : ''}
  res.status(200).json({ message: 'Hello from API route!' });
}
`
    : `${useAbimongo ? `const { initAbimongo } = require('../../lib/abimongo.config');\n` : ''}
export default async function handler(req, res) {
  ${useAbimongo ? 'await initAbimongo();' : ''}
  res.status(200).json({ message: 'Hello from API route!' });
}
`;

  fs.writeFileSync(path.join(apiDir, `hello.${ext}`), apiHandler);

  // 3. Create .env file
  fs.writeFileSync(
    path.join(rootDir, '.env.local'),
    `MONGO_URI=mongodb://localhost:27017/${projectName}`
  );

  // 4. Create Abimongo config
  if (useAbimongo) {
    const abimongoConfig = useTypeScript
      ? `import { AbimongoClient } from 'abimongo_core';

const client = new AbimongoClient({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}'
});

export async function initAbimongo() {
  // You can use a try-catch block to handle connection errors
  try {
  await client.connect();
  // Add model registration here
  } catch (error) {
    console.error('Error connecting to Abimongo:', error);
    process.exit(1);
  }
}
`
      : `const { AbimongoClient } = require('abimongo_core');

const client = new AbimongoClient({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/${projectName}'
});

async function initAbimongo() {
  // You can use a try-catch block to handle connection errors
  await client.connect();
  // Add model registration here
}

module.exports = { initAbimongo };
`;

    fs.writeFileSync(path.join(configDir, `abimongo.config.${ext}`), abimongoConfig);
  }

  // 5. Optional utils
  if (includeUtils) {
    const utilsDir = path.join(rootDir, 'lib', 'utils');
    fs.ensureDirSync(utilsDir);

    const utilCode = useTypeScript
      ? `export function respondSuccess(data: any) {
  return { success: true, data };
}`
      : `function respondSuccess(data) {
  return { success: true, data };
}
module.exports = { respondSuccess };`;

    fs.writeFileSync(path.join(utilsDir, `helper.${ext}`), utilCode);
  }

  // 6. Install Abimongo_Core
  if (useAbimongo) {
    console.log(chalk.yellow('📦 Installing abimongo_core...'));
    execSync(`npm install abimongo_core`, { cwd: rootDir, stdio: 'inherit' });
  }

  console.log(chalk.green('\n✅ Next.js app setup complete!\n'));
}
