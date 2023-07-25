import { program } from 'commander';

import { start } from './actions/start';
import { sync } from './actions/sync';

program
  .command('sync')
  .argument('[path...]', 'Pm2 config files for organizing applications')
  .option('-c, --config [path]', 'Config file for managing process', 'pm2.conf')
  .action(sync);

program
  .command('start')
  .argument('[path...]', 'Pm2 config files for organizing applications')
  .option('-n, --name [name]', 'Pm2 task name', 'pm2-sync')
  .option('-c, --config [path]', 'Config file for managing process', 'pm2.conf')
  .action(start);

program.parse(process.argv);
