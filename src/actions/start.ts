import { promisify } from 'util';

import pm2 from 'pm2';

import { log, error } from '../shared/logger.js';

const connect = promisify(pm2.connect.bind(pm2));

export interface StartOptions {
  name: string;
  config: string;
}

export async function start(paths: string[], options: StartOptions) {
  await connect();

  pm2.start(
    {
      name: options.name,
      cwd: process.cwd(),
      script: require.resolve('../cli'),
      args: `sync ${paths.map((p) => `"${p}"`).join(' ')} -c ${options.config}`,
    },
    (err) => {
      if (err) {
        error('start pm2-sync failed', err);
        process.exit(1);
      }
      log('pm2-sync is running in background');
      pm2.disconnect();
    },
  );
}
