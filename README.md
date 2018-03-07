# CL2 Front

[![CircleCI](https://circleci.com/gh/CitizenLabDotCo/cl2-front.svg?style=svg&circle-token=46bc7ddacbeec9135870cb8765c2968f590ed7e6)](https://circleci.com/gh/CitizenLabDotCo/cl2-front)



## Prerequisites
- NodeJS (use nvm or a similar tool in order to be able to install different versions side by side)
- A text editor/IDE that is compatible with [editorconfig]() and [Typescript]()
- [cl2-back](https://github.com/CitizenLabDotCo/cl2-back) must be running on an accessible machine. The usual setup is to make it run in the same machine.

## Setup
1. `git clone` the repository
2. Run `npm install` in the root of the repository
3. Optional: If you want to be able to run the end-to-end tests, run `npm run e2e-setup`

## Running

If you have [cl2-back](https://github.com/CitizenLabDotCo/cl2-back) running on the same machine, with the default port (4000):
```
npm start
```

If [cl2-back](https://github.com/CitizenLabDotCo/cl2-back) runs on a different machine / port:
```
API_HOST=XXX API_PORT=YYY npm start
```
(replace XXX with the hostname or ip and YYY with the port of your instance of cl2-back)

## Notes


## Tips


## IDE setup

Your text editor of choice should support Editorconfig and Typescript.
It is also recommended that it supports ESLint and TSLint in order to give you immediate feedback.
