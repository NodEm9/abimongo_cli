// src/cli/utils/banner.ts

import figlet from 'figlet';
import chalk from 'chalk';

export function showBanner() {
  try {
    const banner = figlet.textSync('Abimongo CLI', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    });

    console.log(chalk.cyan(banner));
  } catch (error) {
    console.warn(
      chalk.yellow('⚠️ Figlet font not found or failed to load. Displaying fallback banner.')
    );
    console.log(chalk.cyan('=== Abimongo CLI ==='));
  }
}
