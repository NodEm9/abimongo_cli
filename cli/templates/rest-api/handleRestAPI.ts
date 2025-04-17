// src/cli/templates/rest-api/handleRestAPI.ts
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'child_process';

export async function handleRestAPI(projectName: string) {
  const rootDir = path.join(process.cwd(), projectName);

  const configDir = path.join(rootDir, 'src/config');
  const controllersDir = path.join(rootDir, 'src/controllers');
  const modelsDir = path.join(rootDir, 'src/models');
  const routesDir = path.join(rootDir, 'src/routes');
  const graphqlDir = path.join(rootDir, 'src/graphql');


  await fs.ensureDir(configDir);
  await fs.ensureDir(controllersDir);
  await fs.ensureDir(modelsDir);
  await fs.ensureDir(routesDir);
  await fs.ensureDir(graphqlDir);

  const databaseFile = path.join(configDir, 'database.ts');
  const routesFile = path.join(routesDir, 'user.routes.ts');
  const graphqlIndexFile = path.join(graphqlDir, 'index.ts');
  const graphqlResolversFile = path.join(graphqlDir, 'resolvers.ts');
  const controllersFile = path.join(controllersDir, 'user.controller.ts');
  const modelsFile = path.join(modelsDir, 'user.model.ts');

  const indexFile = path.join(rootDir, 'app.ts');
  const serverFile = path.join(rootDir, 'server.ts');
  const packageFile = path.join(rootDir, 'package.json');
  const envFile = path.join(rootDir, '.env');
  const tsconfigFile = path.join(rootDir, 'tsconfig.json');
  const readMeFile = path.join(rootDir, 'README.md');

  console.log(chalk.blue(`🚀 Creating Abimongo_Core REST API project in ${rootDir}...`));

  // Create the database.ts file with the Abimongo client connection code
  await fs.writeFileSync(
    databaseFile,
    `
import { AbimongoClient } from 'abimongo_core';
import dotenv from 'dotenv';

dotenv.config();

export const getDB = async (tenantId: string) => {
  const uri = process.env.MONGO_URI!;
  return await AbimongoClient.getDatabase(tenantId, uri);
};

// or use this for a non-tenant database connection
// This is useful for testing or if you want to connect to a database without tenant isolation
export const getDBWithoutTenant = async () => {
  const uri = process.env.MONGO_URI!;
  return await AbimongoClient.connect(uri);
};
`
  );

  // Create the user.routes.ts file with the REST API routes
  await fs.writeFileSync(
    routesFile,
    `
import express from 'express';
import { getAllUsers } from '../controllers/user.controller';

const router = express.Router();
router.get('/users', getAllUsers);

export default router;
`
  );

  // Create the user.controller.ts file with the controller logic
  await fs.writeFileSync(
    controllersFile,
    `
import { Request, Response } from 'express';
import { getUserModel } from '../models/user.model';

export const getAllUsers = async (req: Request, res: Response) => {
const tenantId = req.headers['x-tenant-id'] as string;
const User = await getUserModel(tenantId);
const users = await User.findAll();
res.json(users);
};
`
  );

  // Create the user.model.ts file with the AbimongoModel
  await fs.writeFileSync(
    modelsFile,
    `
import { AbimongoSchema, AbimongoModel } from 'abimongo_core';

const UserSchema = new AbimongoSchema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'user' }
});

export const getUserModel = async (tenantId: string) => {
  const db = await import('../config/database').then(m => m.getDB(tenantId));
  return new AbimongoModel('User', UserSchema, db, tenantId);
};
`
  );

  // Create the graphql.ts file with the GraphQL schema and resolvers
  await fs.writeFileSync(
    graphqlIndexFile,
    `
import { AbimongoGraphQL } from 'abimongo_core';
import { getUserModel } from '../models/user.model';

export const schema = AbimongoGraphQL.getInstance()
.generateSchema({
  schemas: [getUserModel],
  useGraphQLPlayground: true,
});
`
  );

  // Create the resolvers.ts file with the GraphQL resolvers
  await fs.writeFileSync(
    graphqlResolversFile,
    `
// You can define custom resolvers here if needed in the future
export const resolvers = {};
`
  );

  // Create the app.ts file with the Express server setup
  await fs.writeFileSync(
    indexFile,
    `
import express from 'express';
import userRoutes from './src/routes/user.routes';
import { schema } from './src/graphql';
import { createHandler } from 'graphql-http/lib/use/express'

const app = express();
app.use(express.json());

// Middleware to simulate multi-tenant via headers
app.use((req, res, next) => {
  if (!req.headers['x-tenant-id']) {
    res.status(400).json({ error: 'Missing tenant ID' });
  } else {
    next();
  }
});

app.use('/api', userRoutes);

// Optional: Enable GraphQL endpoint
app.use('/graphql', createHandler({ schema }));
// or
app.all('/graphql', createHandler({ schema }));

// Optional: You can add more routes here if needed
// app.use('/api/other', otherRoutes);

export default app;
`
  );

  // Create the server.ts file with the server entry point
  await fs.writeFileSync(
    serverFile,
    `
import app from './app';
import { getDB, getDBWithoutTenant } from './src/config/database';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, async () => {
  await getDBWithoutTenant(); // Connect to the database without tenant isolation
  console.log(\`🌍 Connected to MongoDB at \${process.env.DB_NAME}\`);
  console.log(\`🚀 Server is running on http://localhost:\${PORT}\`);
  console.log(\`🧬 GraphQL available at http://localhost:\${PORT}/graphql\`);
});

// Optional: You can add more server configurations here if needed
`
  );

  // Create the .env file with the MongoDB connection string
  fs.writeFileSync(
    envFile,
    `
MONGO_URI=mongodb://localhost:27017/abimongo_rest_api
DB_NAME=abimongo_rest_api
PORT=5000
`
  );

// Create the package.json file with the project metadata and scripts
fs.writeFileSync(
packageFile,
`
{
	"name":"abimongo-rest-api",
	"version":"1.0.0",
	"description":"REST API scaffolded using Abimongo_Core",
	"main":"dist/server.js",
	"private":true,
	"scripts":{
		"dev":"ts-node-dev --respawn --transpile-only src/server.ts",
		"start":"node dist/server.js",
		"build":"tsc"
	},
	"author": {},
	"module": "commonjs",
	"license":"ISC",
	"dependencies":{
		"abimongo_core":"^0.0.21",
		"dotenv":"^16.5.0",
		"express":"^5.1.0",
		"graphql-http":"^1.22.4"
	},
	"devDependencies":{
		"@types/express":"^5.0.1",
		"@types/node":"^22.14.1",
		"typescript":"^5.8.3"
	}
}
`
);

  // Create the tsconfig.json file with the TypeScript configuration
  fs.writeFileSync(
    tsconfigFile,
    `
{
"compilerOptions": {
  "target": "ES2021",
  "module": "commonjs",
  "outDir": "dist",
  "strict": true,
  "esModuleInterop": true,
  "skipLibCheck": true,
  "forceConsistentCasingInFileNames": true
},
"include": ["src/**/*"]
}
`
  );

  // Create the README.md file with project information
  fs.writeFileSync(
    readMeFile,
    `
# Abimongo REST API Template

This project was scaffolded using the Abimongo_Core CLI.
It supports multi-tenancy and is powered by AbimongoSchema and AbimongoModel.

## Getting Started

1. npm install
2. npm run dev

Ensure you send an x-tenant-id header with every request.

## Environment Variables
Create a \`.env\` file in the root directory with the following variables:
\`\`\`

MONGO_URI=mongodb://localhost:27017/your_database_name
DB_NAME=your_database_name
PORT=5000

\`\`\`
## License
This project is licensed under the Apache-2.0 License.
`
  )

  // Install dependencies
  // execSync('npm init -y', { cwd: rootDir, stdio: 'inherit' });
  execSync('npm install express dotenv abimongo_core graphql-http', { cwd: rootDir, stdio: 'inherit' });
  execSync('npm install --save-dev typescript @types/express @types/node', { cwd: rootDir, stdio: 'inherit' });
  execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
  console.log(chalk.blue(`📦 Installing dependencies...`));

  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });


  console.log(chalk.green(`✔ Dependencies installed successfully.`));
  // await fs.copy(templateDir, destinationDir);
  console.log(chalk.green(`✔ REST API project "${projectName}" created successfully.`));
  console.log(chalk.blue(`👉 cd ${projectName}`));
  console.log(chalk.blue(`👉 npm run dev`));
  console.log(chalk.blue(`👉 Customize your Abimongo_Core-powered REST API from there.`));

}




















// import path from 'path';
// import { createProjectStructure } from '../../../utils/createProjectStructure';
// import { copyTemplateFiles } from '../../utils/copyTemplateFiles';
// import { installDependencies } from '../../utils/installDependencies';

// export const handleRESTAPI = async (projectName: string) => {
//   const targetDir = path.resolve(process.cwd(), projectName);
//   const templateDir = path.resolve(__dirname, 'template');

//   console.log(`\n🚀 Creating Abimongo_Core REST API project in ${targetDir}...\n`);

//   await createProjectStructure('rest-api', projectName);
//   await copyTemplateFiles(templateDir, targetDir);
//   await installDependencies(targetDir);

//   console.log(`\n✅ REST API scaffold complete! Run the following:`);
//   console.log(`\n  cd ${projectName}`);
//   console.log(`  npm run dev`);
// };


// 	// Note: You can add more functionality here, like initializing a git repository, etc.
// 	// For example:
// 	// await initGitRepository(targetDir);
// 	// console.log(`\n📦 Git repository initialized!`);