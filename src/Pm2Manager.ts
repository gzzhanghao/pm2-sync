import { promisify } from 'util';

import chalk from 'chalk';
import pm2 from 'pm2';

import * as logger from './shared/logger';

const list = promisify(pm2.list.bind(pm2));
const start = promisify(pm2.start.bind(pm2));
const stop = promisify(pm2.stop.bind(pm2));
const del = promisify(pm2.delete.bind(pm2));
const restart = promisify(pm2.restart.bind(pm2));

export interface Pm2ManagerOptions {
  configFile: string;
}

export type RequiredFields<T, TFields extends keyof T> = T &
  Pick<Required<T>, TFields>;

export type AppOptions = RequiredFields<pm2.StartOptions, 'name'>;

export type GetUserAppsFn = () => AppOptions[] | Promise<AppOptions[]>;

export class Pm2Manager {
  constructor(private readonly getUserApps: GetUserAppsFn) {}

  async getUserConfig() {
    const [userApps, pm2Apps] = await Promise.all([
      this.getUserApps(),
      this.getPm2Apps(),
    ]);

    const pidMap = new Map<string, number | undefined>();
    const pmidMap = new Map<string, number | undefined>();

    for (const item of pm2Apps) {
      const name = item.name || `<anoymous:${item.pm_id}>`;
      pidMap.set(name, item.pid);
      pmidMap.set(name, item.pm_id);
    }

    const taskList = Array.from(
      new Set([
        ...userApps.map((item) => item.name),
        ...Array.from(pmidMap.keys()),
      ]),
    );

    const config = taskList.map(
      (name) =>
        `${pidMap.get(name) ? '$' : '.'} ${name}${
          pmidMap.get(name) != null ? ` # ${pmidMap.get(name)}` : ''
        }`,
    );

    return `${config.join('\n')}\n`;
  }

  async applyUserConfig(config: string) {
    const actions = config
      .split('\n')
      .map((item) => item.replace(/#.+$/, ''))
      .filter(Boolean)
      .map((line) => {
        const [action, name] = line.split(' ');
        return { action, name };
      });

    const [userApps, pm2Apps] = await Promise.all([
      this.getUserApps(),
      this.getPm2Apps(),
    ]);

    const pidMap = new Map<string, number | undefined>();
    const pmidMap = new Map<string, number | undefined>();

    for (const item of pm2Apps) {
      const name = item.name || `<anoymous:${item.pm_id}>`;
      pidMap.set(name, item.pid);
      pmidMap.set(name, item.pm_id);
    }

    await Promise.all(
      actions.map(({ action, name }) => {
        const pkg = userApps.find((pkg) => pkg.name === name);
        const pid = pidMap.get(name);
        const pmid = pmidMap.get(name);

        if ('+'.includes(action) && !pid) {
          logger.log(`starting ${chalk.green(name)}`);
          if (pmid != null) {
            return restart(pmid as any);
          }
          if (pkg) {
            return start(pkg as any);
          }
          return restart(name);
        }

        if ('-'.includes(action) && pmid != null) {
          logger.log(`stopping ${chalk.redBright(name)}`);
          return stop(pmid);
        }

        if ('!'.includes(action) && pmid != null) {
          logger.log(`deleting ${chalk.red(name)}`);
          return del(pmid);
        }

        if ('@'.includes(action)) {
          logger.log(`restarting ${chalk.cyanBright(name)}...`);
          if (pmid != null) {
            return restart(pmid);
          }
          if (pkg) {
            return start(pkg as any);
          }
          return restart(name);
        }
      }),
    );
  }

  private async getPm2Apps() {
    return list() as unknown as RequiredFields<
      pm2.ProcessDescription,
      'name'
    >[];
  }
}
