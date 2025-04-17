import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { handleMERNStack } from '../templates/mern/handleMERNStack';
import { handleNextApp } from '../templates/next/handleNextApp';
import { handleGraphQLAPI } from '../templates/graphql-api/handleGraphQLAPI';
import { handleRestAPI } from '../templates/rest-api/handleRestAPI';

interface ProjectChoices {
  projectType: string;
  projectName: string;
}

export async function generateProject(choices: ProjectChoices) {
  const { projectType, projectName } = choices;
  const projectRoot = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectRoot)) {
    console.log(chalk.red(`Folder ${projectName} already exists.`));
    return;
  }

  fs.mkdirSync(projectRoot, { recursive: true });

  switch (projectType) {
    case 'MERN Stack':
      return handleMERNStack(projectName);
    case 'Next.js App':
      return handleNextApp(projectName);
    case 'REST API':
      return handleRestAPI(projectName);
    case 'GraphQL API':
    return handleGraphQLAPI(projectName);
    default:
      console.log(chalk.red(`Unknown or Invalid project type: ${projectType}`));
  }

  console.log(chalk.green(`✅ ${projectType} project "${projectName}" created successfully.`));
}

