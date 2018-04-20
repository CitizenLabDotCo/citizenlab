# CL2 Front

[![CircleCI](https://circleci.com/gh/CitizenLabDotCo/cl2-front.svg?style=svg&circle-token=46bc7ddacbeec9135870cb8765c2968f590ed7e6)](https://circleci.com/gh/CitizenLabDotCo/cl2-front)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=d2d5RDVDNHBGeHJFZjh2dHEyQ1FPUHRDc2Y3MFhGOXZiSjZsZFFqMEl0QT0tLWgwNzFuVThDUkNGR0JHSlhralhqbmc9PQ==--ee3c39ea9e8b82faaa48e43e3cea883277221935%)](https://www.browserstack.com/automate/public-build/d2d5RDVDNHBGeHJFZjh2dHEyQ1FPUHRDc2Y3MFhGOXZiSjZsZFFqMEl0QT0tLWgwNzFuVThDUkNGR0JHSlhralhqbmc9PQ==--ee3c39ea9e8b82faaa48e43e3cea883277221935%)



## Prerequisites
- NodeJS (use nvm or a similar tool in order to be able to install different versions side by side)
- A text editor/IDE that is compatible with [Editorconfig][editorconfig] and [Typescript][typescript]
- [cl2-back][cl2back] must be running on an accessible machine. The usual setup is to make it run in the same machine.

## Setup
1. `git clone` the repository
2. Run `npm install` in the root of the repository
3. Optional: If you want to be able to run the end-to-end tests, run `npm run e2e-setup`

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

Tests are run automatically every night at midnight (UTC). Please check the status of these on a regular basis in order to ensure nothing is broken.

If you want to manually run these tests, you will need a browserstack user/key combo and the URL of a test platform, then run this command, replacing `xxx`, `yyy` and `zzz` with the appropriate info:
```
BROWSERSTACK_USER=xxx BROWSERSTACK_KEY=yyy ROOT_URL=zzz npm run test:browserstack
```

## IDE setup

Your text editor of choice should support [Editorconfig][editorconfig] and [Typescript][typescript].
It is also recommended that it supports [ESLint][eslint] and [TSLint][tslint] in order to give you immediate feedback.

For all these reasons, [VSCode][vscode] is the preferred editor, but feel free to use something else if you'd like.


[cl2back]: https://github.com/CitizenLabDotCo/cl2-back
[editorconfig]: http://editorconfig.org/
[typescript]: http://www.typescriptlang.org/
[eslint]: https://eslint.org/
[tslint]: https://palantir.github.io/tslint/
[vscode]: https://code.visualstudio.com/
