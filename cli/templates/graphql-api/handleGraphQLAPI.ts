import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'child_process';


export async function handleGraphQLAPI(projectName: string) {
  const rootDir = path.join(process.cwd(), projectName);

  const entryDir = path.join(rootDir, 'src');
  const extrasDir = path.join(rootDir, 'extras');

  await fs.ensureDir(entryDir);
  await fs.ensureDir(extrasDir);

  //Populate the src folder
  const configDir = path.join(entryDir, 'config');
  await fs.ensureDir(configDir);
  const dbFile = path.join(configDir, 'db.ts');
  const indexFile = path.join(entryDir, 'index.ts');

  //Publish the extras folder
  const graphqlDir = path.join(extrasDir, 'graphql');
  await fs.ensureDir(graphqlDir);
  const indexGraphqlFile = path.join(graphqlDir, 'index.ts');
  const typeDefsFile = path.join(graphqlDir, 'typeDefs.ts');
  const resolversFile = path.join(graphqlDir, 'resolvers.ts');


  const packageJsonPath = path.join(rootDir, 'package.json');
  const tsconfigPath = path.join(rootDir, 'tsconfig.json');
  const envPath = path.join(rootDir, '.env.local');
  const readMePath = path.join(rootDir, 'README.md');
  const gitIgnorePath = path.join(rootDir, '.gitignore');


  console.log(chalk.blue(`📦 Creating GraphQL API project "${projectName}"...`));

  fs.writeFileSync(
    packageJsonPath,
    `{
  "name": "abimongo-graphql-api",
  "version": "1.0.0",
  "description": "Abimongo GraphQL API",
  "main": "src/index.js",
  "type": "module",
  "license": "ISC",
  "scripts": {
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "@apollo/server": "^4.11.3",
    "graphql": "^16.10.0",
    "abimongo_core": "latest",
    "graphql-tag": "^2.12.6",
    "graphql-http": "^1.22.4",
    "@graphql-tools/schema": "^10.0.23"
  },
  "devDependencies": {
    "ts-node": "^10.9.2",
    "typescript": "^5.8.2"
  }
}
`);

  fs.writeFileSync(
    tsconfigPath,
    `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "preserve",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./"
  }
}`
  );

fs.writeFileSync(
  envPath,
    `
# Environment variables for the GraphQL API
MONGO_URI=mongodb://localhost:27017/mydatabase
DB_NAME=mydatabase
`
  );

fs.writeFileSync(
  dbFile,
  `
import { AbimongoClient } from 'abimongo_core';

export async function connectToDb() {
  const db = new AbimongoClient({
    uri: "mongodb://localhost:27017",
    dbName: 'abimongo_graphql_db'
  }); 
  console.log('✅ Connected to MongoDB');
  return db;
}
`
  )

fs.writeFileSync(
  indexFile,
  `
  import { ApolloServer } from '@apollo/server';
  import typeDefs from '../extras/graphql/typeDefs';
  import resolvers from '../extras/graphql/resolvers';
  import { connectToDb } from './config/db';
  import { expressMiddleware, ExpressContextFunctionArgument } from '@apollo/server/express4';
  import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
  import express from 'express';
  import http from 'http';
  import cors from 'cors';
  
  interface MyContext {
    token?: String;
  }
  
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  
  connectToDb().then(() => {
    console.log('✅ Connected to MongoDB');
  }).catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
  });
  
  await server.start();
  
  app.use('/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }:  ExpressContextFunctionArgument) => ({ token: req.headers.token }),
    }) as unknown as express.RequestHandler<ExpressContextFunctionArgument, any, any>,
  );
  
  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log("🚀 Server ready at http://localhost:4000/graphql");
`
  );

fs.writeFileSync(
  indexGraphqlFile,
  `
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './typeDefs';
import resolvers from './resolvers';

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
`
  )

  fs.writeFileSync(
typeDefsFile,
`
import { gql } from 'graphql-tag';

// Define your GraphQL schema using the gql template literal
// This is where you can define your types, queries, mutations, and subscriptions
const typeDefs = gql\`
  type User {
    id: ID!
    name: String!
  }
  type Query {
    users: [User]
  }
  type Mutation {
    createUser(name: String!): User
  }
  type Subscription {
    userCreated: User
  };

\`

export default typeDefs; 
`)

fs.writeFileSync(
  resolversFile,
  `
export default {
Query: {
  hello: () => 'Hello from AbimongoGraphQL CLI template!'
}
};
`)

  fs.writeFileSync(
    readMePath,
    `# Abimongo GraphQL API
This is a GraphQL API project scaffolded with Abimongo CLI.

It is a simple GraphQL API that connects to a MongoDB database using Abimongo.
It includes a basic query to demonstrate the setup. Use this as a starting point for your own GraphQL API.

## Getting Started
1. Install dependencies: \`npm install\`
2. Start the server: \`npm run dev\`
3. Access the GraphQL playground at \`http://localhost:4000/graphql\`
4. Add your models using AbimongoSchema
5. Use AbimongoGraphQL to auto-generate your GraphQL schema
6. Customize the resolvers and type definitions as needed
7. Enjoy building your GraphQL API!
`)

fs.writeFileSync(
gitIgnorePath,
`
node_modules
dist
.env.local
.DS_Store
*.log
package-lock.json
`)

  //Install dependencies
  execSync('npm install express cors dotenv', { cwd: rootDir, stdio: 'inherit' });
  execSync('npm install --save-dev typescript @types/express @types/node', { cwd: rootDir, stdio: 'inherit' });
  console.log(chalk.blue(`📦 Installing dependencies...`));
  execSync('npm install', { cwd: rootDir, stdio: 'inherit' });

  console.log(chalk.green(`\nGraphQL API project "${projectName}" created successfully! 🚀`));
  console.log(chalk.yellow(`\nNext Steps:
    1. cd ${projectName}
    2. Add your models using AbimongoSchema
    3. Use AbimongoGraphQL to auto-generate your GraphQL schema
    4. Start your server: npm run dev
  `));
}