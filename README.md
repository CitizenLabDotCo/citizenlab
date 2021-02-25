# cl2-front

test
[![CircleCI](https://circleci.com/gh/CitizenLabDotCo/cl2-front/tree/master.svg?style=svg&circle-token=46bc7ddacbeec9135870cb8765c2968f590ed7e6)](https://circleci.com/gh/CitizenLabDotCo/cl2-front/tree/master)

## Prerequisites

- NodeJS (use nvm or a similar tool in order to be able to install different versions side by side)
- A text editor/IDE that is compatible with [Editorconfig][editorconfig] and [Typescript][typescript]
- [cl2-back][cl2back] must be running on an accessible machine. The usual setup is to make it run in the same machine.

## Setup

1. `git clone` the repository
2. Run `npm install` in the root of the repository

## Running

If you have [cl2-back][cl2back] running on the same machine, with the default port (4000):

```
npm start
```

If [cl2-back][cl2back] runs on a different machine / port:

```
API_HOST=XXX API_PORT=YYY npm start
```

(replace `XXX` with the hostname or ip and `YYY` with the port of your instance of cl2-back)

## E2E tests

The E2E tests are run whenever a change to the Master branch occurs. You can view the results on CircleCI.

To manually run the e2e tests once:

```
npm run cypress:run
```

To run the e2e tests in watcher mode:

```
npm run cypress:open
```

**Note**: The e2e tests depend on some data being available in the back-end. To set it up for testing, see [e2e tests in cl2-back](https://github.com/CitizenLabDotCo/cl2-back#end-to-end-tests).

## Unit and integration tests

These tests are run on each PR. Jest will consider every file with the extention `.test.(ts|tsx)` a test.

To manually run them once

```
npm test
```

To run the tests in watcher mode :

```
npm run test:watch
```

Quick reminder of the watcher commands: a to run all tests, enter to re-run, u to update a snapshot (make sure the changes are as expected before pushing new snapshots).

If tests run crashes you might have to increase the number of watchable files.

On linux this means running :

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

## IDE setup

Your text editor of choice should support [Editorconfig][editorconfig] and [Typescript][typescript].
It is also recommended that it supports [TSLint][tslint] in order to give you immediate feedback.

For all these reasons, [VSCode][vscode] is the preferred editor, but feel free to use something else if you'd like.

[cl2back]: https://github.com/CitizenLabDotCo/cl2-back
[editorconfig]: http://editorconfig.org/
[typescript]: http://www.typescriptlang.org/
[tslint]: https://palantir.github.io/tslint/
[vscode]: https://code.visualstudio.com/
