# CL2 Front

## Notes

**How to customize Foundation components**

1. edit components in `./app/components/Foudation/src`
2. visit `http://localhost:3000/dev/foundation` to see changes
3. run `npm run test:foundation` to make sure tests are passing

## Tips

**Useful Cli commands**

* `npm generate component`
* `npm generate route`

**How to import CSS libraries**

[reference](https://github.com/react-boilerplate/react-boilerplate/issues/238)

1. install package using npm/yarn.
`yarn install foundation-sites`

2. add a import statement to app.js like below.
`import '!!style-loader!css-loader!../node_modules/foundation-sites/dist/css/foundation.min.css';`
