// src/cli/commands/handlers/handleMERNStack.ts
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';


export async function handleMERNStack(projectName: string) {
	const rootDir = path.join(process.cwd(), projectName);

	console.log(chalk.cyan(`\n📦 Creating MERN stack project in ${rootDir}...\n`));

	const clientDir = path.join(rootDir, 'client');
	const serverDir = path.join(rootDir, 'server');

	// Step 1: Create base folders
	fs.ensureDirSync(clientDir);
	fs.ensureDirSync(serverDir);

	// Step 2: Initialize React app
	console.log(chalk.yellow('⚛️  Setting up React frontend...'));
	execSync(`npx create-react-app ${clientDir} --template typescript`, { stdio: 'inherit' });

	// Step 3: Setup Express API backend
	console.log(chalk.yellow('🚀 Setting up Express backend...'));

	fs.writeFileSync(
		path.join(serverDir, 'index.ts'),
		`import express from 'express';
import { AbimongoClient } from 'abimongo_core';
import cors from 'cors';
import { config } from 'dotenv';

config();
const app = express();
app.use(cors());
app.use(express.json());

const client = new AbimongoClient({ uri: 'mongodb://localhost:27017/yourDB' });
await client.connect();

app.get('/', (_, res) => {
	res.send('API is running...')
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`
	);

	fs.writeFileSync(path.join(serverDir, '.env'), `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${projectName}`);

	// Step 4: Create package.json and install deps
	execSync(`npm init -y`, { cwd: serverDir, stdio: 'inherit' });
	execSync(
		`npm install express cors dotenv abimongo_core`,
		{ cwd: serverDir, stdio: 'inherit' }
	);
	execSync(`npm install -D typescript ts-node @types/express @types/node`, {
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

	console.log(chalk.green('\n✅ MERN Stack project setup complete!'));
}
