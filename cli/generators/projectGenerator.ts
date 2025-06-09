import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { handleMERNStack } from '../templates/mern/handleMERNStack';
import { handleNextApp } from '../templates/next/handleNextApp';
import { handleGraphQLAPI } from '../templates/graphql-api/handleGraphQLAPI';
import { handleRestAPI } from '../templates/rest-api/handleRestAPI';
import { ProjectChoices } from '../utils/types';


/**
 * Generates a new project based on the provided choices.
 *
 * @param {ProjectChoices} choices - The user's choices for project generation.
 * @returns {Promise<void>} A promise that resolves when the project is generated.
 */
export async function generateProject(choices: ProjectChoices) {
  const { projectType, projectName, useAbimongo, useTypeScript, includeUtils } = choices;
  const projectRoot = path.resolve(process.cwd(), projectName);

  // Check if the project folder already exists
  if (fs.existsSync(projectRoot)) {
    console.log(chalk.red(`❌ Folder ${projectName} already exists.`));
    return;
  }

  // Create the project folder
  fs.mkdirSync(projectRoot, { recursive: true });
  // writeDefaultAbimongoConfig(projectRoot);
  

  // Handle project generation based on the project type
  switch (projectType) {
    case 'MERN Stack':
      return await handleMERNStack(projectName, { useTypeScript, useAbimongo, includeUtils });;
    case 'Next.js App':
      return await handleNextApp(projectName, { useTypeScript, useAbimongo, includeUtils });
    case 'REST API':
      return await handleRestAPI(projectName, { useTypeScript, useAbimongo, includeUtils });
    case 'GraphQL API':
      return await handleGraphQLAPI(projectName, { useTypeScript, useAbimongo, includeUtils });
    default:
      console.log(chalk.red(`Unknown or Invalid project type: ${projectType}`));
  }
  // Log success message
  console.log(chalk.green(`✅ ${projectType} project "${projectName}" created successfully.`));
}




// function writeDefaultAbimongoConfig(projectPath: string) {
//   const configPath = path.join(projectPath, 'abimongo.config.json');

//   const defaultJson = {
//     projectName: "my-abimongo-app",
//     database: {
//       uri: "mongodb://localhost:27017/mydatabase",
//       options: {}
//     },
//     features: {
//       logger: true,
//       graphql: false,
//       multiTenant: false,
//       enableRedis: false
//     },
//     logger: {
//       level: "info",
//       transports: [
//         {
//           type: "file",
//           path: "./logs/app.log"
//         }
//       ]
//     }
//   };

//   fs.writeFileSync(configPath, JSON.stringify(defaultJson, null, 2), 'utf-8');
// }

