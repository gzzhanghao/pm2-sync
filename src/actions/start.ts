import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import chokidar from 'chokidar';
import pm2 from 'pm2';

import { AppOptions, GetUserAppsFn, Pm2Manager } from '../Pm2Manager';
import * as logger from '../shared/logger';

const connect = promisify(pm2.connect.bind(pm2));

export interface StartOptions {
  config: string;
}

export interface Pm2Config {
  apps?: AppOptions;
  getApps?: GetUserAppsFn;
}

export async function start(paths: string[], options: StartOptions) {
  const configPath = path.resolve(options.config);

  const configModules: Pm2Config[] = paths.map((filename) =>
    require(path.resolve(filename)),
  );

  const mgr = new Pm2Manager(async () => {
    const apps = await Promise.all(
      configModules.map((mod) =>
        mod.apps ? mod.apps : mod.getApps ? mod.getApps() : [],
      ),
    );
    return apps.flat();
  });

  let latestUserConfig = '';

  await connect();

  chokidar
    .watch(configPath, { ignoreInitial: true })
    .on('add', update)
    .on('change', update)
    .on('unlink', update)
    .once('ready', () => {
      logger.log(chalk.greenBright('dev service ready'));
    });

  updateUserConfig();

  async function update() {
    try {
      const newUserConfig = await fs.promises.readFile(configPath, 'utf-8');
      if (latestUserConfig === newUserConfig) {
        logger.log(chalk.gray('nothing changed'));
        return;
      }
      logger.log(chalk.gray('updating'));

      await mgr.applyUserConfig(newUserConfig);
      await updateUserConfig();

      logger.log(chalk.gray('updated'));
    } catch (error) {
      logger.error(chalk.red('update error'), error);
    }
  }

  async function updateUserConfig() {
    latestUserConfig = await mgr.getUserConfig();
    await new Promise((resolve) => setTimeout(resolve, 10));
    await fs.promises.writeFile(configPath, latestUserConfig);
  }
}
