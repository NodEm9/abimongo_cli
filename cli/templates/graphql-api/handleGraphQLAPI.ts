import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { TemplateOptions } from '../../utils/types';


/**
 * Handles the creation of a GraphQL API project.
 *
 * @param {string} projectName - The name of the project.
 * @param {TemplateOptions} options - Options for the template.
 * @returns {Promise<void>} A promise that resolves when the project is created.
 */
export async function handleGraphQLAPI(
  projectName: string,
  options: TemplateOptions
) {
  const ext = options.useTypeScript ? 'ts' : 'js';
  const rootDir = path.resolve(process.cwd(), projectName);
  const srcDir = path.join(rootDir, 'src');

  console.log(chalk.cyan(`\n🔧 Creating GraphQL API project in ${rootDir}...\n`));
  fs.ensureDirSync(srcDir);

  // Step 1: Write entry file
  const entryFileContent = `
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import cors from 'cors';
${options.useAbimongo ? `import { AbimongoGraphQL } from 'abimongo_core';` : ''}
${options.includeUtils ? `import { setupLogger, Logger } from 'abimongo_utils';` : ''}

const app = express();
app.use(cors());
app.use(express.json());

${options.useAbimongo ? `
const schema = await AbimongoGraphQL.getInsatnce();

app.use('/graphql', graphqlHTTP({ schema.generateSchema(), graphiql: true }));
` : `
app.use('/graphql', graphqlHTTP({ schema: /* your schema here */, graphiql: true }));
`}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`GraphQL server running on port \${PORT}\`));
`;

  fs.writeFileSync(path.join(srcDir, `index.${ext}`), entryFileContent.trimStart());

  // Step 2: .env
  fs.writeFileSync(path.join(rootDir, '.env'), `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${projectName}`);

  // Step 3: Init & install dependencies
  execSync('npm init -y', { cwd: rootDir, stdio: 'inherit' });

  const coreDeps = `express cors dotenv express-graphql graphql${options.useAbimongo ?
    ' abimongo_core' : ''}${options.includeUtils ? ' abimongo_utils' : ''}`;
  execSync(`npm install ${coreDeps}`, { cwd: rootDir, stdio: 'inherit' });

  if (options.useTypeScript) {
    execSync(`npm install -D typescript ts-node @types/express @types/node @types/express-graphql`, {
      cwd: rootDir,
      stdio: 'inherit'
    });

    fs.writeFileSync(path.join(rootDir, 'tsconfig.json'), JSON.stringify({
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

  console.log(chalk.green('\n✅ GraphQL API project setup complete!'));
}



