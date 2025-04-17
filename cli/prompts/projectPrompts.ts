import inquirer from 'inquirer';


export async function promptProjectOptions() {
  return await inquirer.prompt([
    {
      name: 'projectType',
      type: 'list',
      message: 'Select a project template:',
      choices: ['MERN Stack', 'Next.js App', 'REST API', 'GraphQL API']
    },
    {
      name: 'projectName',
      type: 'input',
      message: 'Enter your project name:',
      validate: input => !!input || 'Project name is required.'
    }
  ]);
}

