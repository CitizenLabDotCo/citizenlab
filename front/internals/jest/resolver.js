module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
    packageFilter: (pkg) => {
      // This is a workaround for https://github.com/uuidjs/uuid/pull/616
      //
      // jest-environment-jsdom 28+ tries to use browser exports instead of default exports,
      // but uuid only offers an ESM browser export and not a CommonJS one. Jest does not yet
      // support ESM modules natively, so this causes a Jest error related to trying to parse
      // "export" syntax.
      //
      // This workaround prevents Jest from considering nanoid's module-based exports at all;
      // it falls back to nanoid's CommonJS "main" property.
      //
      // uuid used to be handled here too, but as of v14 it is ESM-only and no longer ships a
      // CommonJS "main", so deleting its exports leaves nothing to resolve. Instead we let its
      // ESM resolve normally and have babel-jest transform it (see transformIgnorePatterns in
      // jest.config.js).
      if (pkg.name === 'nanoid') {
        delete pkg['exports'];
        delete pkg['module'];
      }
      return pkg;
    },
  });
};
