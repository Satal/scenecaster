import chalk from "chalk";
import ora, { type Ora } from "ora";

export interface Logger {
  info(msg: string): void;
  success(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
  spinner(msg: string): Ora;
}

export function createLogger(verbose = false): Logger {
  return {
    info(msg: string) {
      if (verbose) {
        console.log(chalk.blue("ℹ"), msg);
      }
    },
    success(msg: string) {
      console.log(chalk.green("✔"), msg);
    },
    warn(msg: string) {
      console.log(chalk.yellow("⚠"), msg);
    },
    error(msg: string) {
      console.error(chalk.red("✖"), msg);
    },
    spinner(msg: string) {
      return ora(msg).start();
    },
  };
}
