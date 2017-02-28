# CL2 Front

**Useful Cli commands**

* `npm generate component`
* `npm generate route`

**How to import CSS libraries**

[reference](https://github.com/react-boilerplate/react-boilerplate/issues/238)

1. install package using npm/yarn.
`yarn install foundation-sites`

2. add a import statement to app.js like below.
`import '!!style-loader!css-loader!../node_modules/foundation-sites/dist/css/foundation.min.css';`
