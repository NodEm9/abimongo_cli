import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

export async function handleNextApp(projectName: string) {
  const projectPath = path.join(process.cwd(), projectName);

  // 1. Create basic structure
  await fs.ensureDir(path.join(projectPath, 'pages/api'));
  await fs.ensureDir(path.join(projectPath, 'models'));
  await fs.ensureDir(path.join(projectPath, 'lib'));

  // 2. Create core files
  await fs.writeFile(
    path.join(projectPath, 'pages', 'index.tsx'),
    `export default function Home() {
  return <div>Welcome to ${projectName} powered by Abimongo_Core!</div>
}`
  );

  await fs.writeFile(
    path.join(projectPath, 'pages', 'api', 'hello.ts'),
    `import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Hello from Abimongo_Core-powered API!' })
}`
  );

  await fs.writeFile(
    path.join(projectPath, 'models', 'SampleModel.ts'),
    `import { AbimongoSchema } from 'abimongo_core';

export const SampleSchema = new AbimongoSchema({
  name: { type: 'string', required: true },
  description: { type: 'string' },
});

export default SampleSchema;
`
  );

await fs.writeFile(
path.join(projectPath, 'lib', 'abimongo.ts'),
`
import { AbimongoModel, abimongoClient, AbimongoCLient } from 'abimongo_core';
import SampleSchema from '../models/SampleModel';

export const getSampleModel = async (tenantId: string) => {
  const db = await abimongoClient.connect(process.env.MONGODB_URI!);
  let tenantDB = AbimongoClient.getTenantDB(tenantId);

  return new AbimongoModel({
    db: tenantDB, // Use the tenantDB for tenant-specific collections
    collectionName: 'samples',
    schema: SampleSchema,
    tenantId,
    client: db.client,
  });
};
`
  );

await fs.writeFile(
path.join(projectPath, '.env.local'),
`
MONGODB_URI=mongodb://localhost:27017/abimongo_core_test
TENANT_ID=dev-tenant
`
);

await fs.writeFile(
path.join(projectPath, 'next.config.js'),
`/** @type {import('next').NextConfig} */
const nextConfig = {reactStrictMode: true, experimental: { appDir: true }};

module.exports = nextConfig`
);

  await fs.writeFile(
    path.join(projectPath, 'tsconfig.json'),
    `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "esModuleInterop": true
    "noEmit": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}`
  );

  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    `{
  "name": "${projectName}",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "abimongo_core": "^1.0.0",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}`
  );

  await fs.writeFile(
    path.join(projectPath, 'README.md'),
    `# ${projectName}

This is a starter Next.js project powered by **Abimongo_Core**.

## Scripts

- \`npm run dev\` — start development server
- \`npm run build\` — build for production
- \`npm run start\` — start production server

## Multi-Tenancy

This project uses **multi-tenant** support via Abimongo_Core.
`
  );

  // 3. Install dependencies
  console.log(chalk.yellow('\nInstalling dependencies...'));
  execSync('npm install', { cwd: projectPath, stdio: 'inherit' });

  console.log(chalk.green(`\nNext.js project '${projectName}' created successfully using Abimongo_Core!`));
}
