# CL2 Front

![Build Status](https://codeship.com/projects/8d4a8a10-dfdf-0134-b77a-46a6c2bb70db/status?branch=master)


## Running

Install the latest version of the Docker toolbox. Docker Compose should be included. No other dependencies on your system are required.

To run the application, simply run the following command
```
docker-compose up --build
```

To have access to the command line within the docker container, run
```
docker-compose run --user "$(id -u):$(id -g)" --rm web /bin/bash
```
On mac, you can skip the `--user "$(id -u):$(id -g)"` part.

## Notes

**We are using react-boilerplate v3.4.0**

 * [react-bolierplate v3.4.0 docs](https://github.com/react-boilerplate/react-boilerplate/tree/v3.4.0/docs)


**How to customize Foundation components**

1. edit components in `./app/components/Foudation/src`
2. visit `http://localhost:3000/dev/foundation` to see changes
3. run `npm run test:foundation` to make sure tests are passing

## Tips

**A First rule: ALWAYS run `npm t` before `git push`**

**Useful Cli commands**

* `npm generate component`
* `npm generate route`

**How to import CSS libraries**

Install library using npm/yarn and add a import statement to app.js like below. That's it!

`import '../node_modules/foundation-sites/dist/css/foundation.min.css';`

## IDE setup

### Atom
Works quite well with Atom out of the box. It is highly recommended to install `linter` and `linter-eslint` plugins. They will automatically pick up the linter settings from the `package.json` file and give you inline warnings to adhere to the coding standards.
