import inquirer from 'inquirer';


export async function promptProjectOptions() {
  const answers = await inquirer.prompt([
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
    },
    {
      name: 'language',
      type: 'list',
      message: 'Select a language for your project:',
      choices: ['TypeScript', 'JavaScript'],
      default: 'TypeScript'
    },
    {
      name: 'useAbimongo',
      type: 'confirm',
      message: 'Do you want to use Abimongo_Core?',
      default: true
    },
    {
      name: 'includeUtils',
      type: 'confirm',
      message: 'Include Abimongo_Utils (helper APIs)?',
      default: false
    }
  ]);

  return {
    ...answers,
    useTypeScript: answers.language === 'TypeScript'
  };
}



// import inquirer from 'inquirer';

// export async function promptProjectOptions() {
//   return await inquirer.prompt([
//     {
//       name: 'projectType',
//       type: 'list',
//       message: 'Select a project template:',
//       choices: ['MERN Stack', 'Next.js App', 'REST API', 'GraphQL API']
//     },
//     {
//       name: 'projectName',
//       type: 'input',
//       message: 'Enter your project name:',
//       validate: input => !!input || 'Project name is required.'
//     },
//     {
//       name: 'useTypeScript',
//       type: 'confirm',
//       message: 'Would you like to use TypeScript?',
//       default: true
//     },
//     {
//       name: 'useAbimongo',
//       type: 'confirm',
//       message: 'Use Abimongo_Core (recommended)?',
//       default: true
//     },
//     {
//       name: 'includeUtils',
//       type: 'confirm',
//       message: 'Include Abimongo_Utils (helper APIs)?',
//       default: true
//     }
//   ]);
// }

