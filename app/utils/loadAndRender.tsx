// Helper function to load components as async chunks
// Explanation why the import must be static: see the warnings at the bottom of this section: https://webpack.js.org/api/module-methods/#import-
export default (importPromise: Promise<any>) => (_nextState, cb) => {
  importPromise
  .then((Module) => cb(null, Module.default))
  .catch((e) => console.error(e)); // eslint-disable-line no-console
};
