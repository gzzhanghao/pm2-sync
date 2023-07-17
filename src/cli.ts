import { program } from 'commander';

import { start } from './actions/start';

program
  .argument('[path...]', 'Pm2 config files for organizing applications')
  .option('-c, --config [path]', 'Config file for managing process', 'pm2.conf')
  .action(start);

program.parse(process.argv);
