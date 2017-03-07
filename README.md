# CL2 Front

![Build Status](https://codeship.com/projects/8d4a8a10-dfdf-0134-b77a-46a6c2bb70db/status?branch=master)

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
