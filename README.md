# pm2-sync

Manage your pm2 apps with an ease.

## Usage

```bash
npx pm2-sync sync pm2.config.js
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

## `pm2-sync sync`

Synchronize pm2 process with process managing file.

### `[path...]`

Paths to pm2 [configuration files](https://pm2.keymetrics.io/docs/usage/application-declaration/).

### `-c, --config [path]`

Path to process managing file. Default: `pm2.conf`.

## `pm2-sync start`

Start synchronize task in background with pm2. Any arguments for `sync` command can be passed.

### `-n, --name [name]`

Name for synchronize task in pm2.
