# pm2-sync

Manage your pm2 apps with an ease.

## Usage

```bash
npx pm2-sync pm2.config.js
```

Then you can see your pm2 applications listed in `pm2.conf`:

```conf
# in dev.conf
. stopped-application
$ running-application
```

You can manage your pm2 applications by modifying `pm2.conf`, just update the first character of each line and save it:

```conf
+ start-application
- stop-application
@ restart-application
! delete-application
```

pm2-sync will manage the applications for you:

```
updating
starting start-application...
stopping stop-application...
restarting restart-application...
deleting delete-application...
updated
```

## Options

### [paths...]

Paths to pm2 config files that provides application definitions.

### -c, --config

Path to the process managing config file. **Default:** `pm2.conf`
