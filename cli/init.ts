#!/usr/bin/env node
import { Command } from 'commander';
import { promptProjectOptions } from '../cli/prompts/projectPrompts'; 
import { generateProject } from '../cli/generators/projectGenerator';
import { showBanner } from '../cli/utils/banner';

showBanner(); 

const program = new Command();

function initProject() {
program
  .name('abimongo-scaffold')
  .description('CLI to scaffold fullstack projects using Abimongo_Core')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new project')
  .action(async () => {
    const options = await promptProjectOptions();
    await generateProject(options);
  });

	program.parse(process.argv);
}

export default initProject;