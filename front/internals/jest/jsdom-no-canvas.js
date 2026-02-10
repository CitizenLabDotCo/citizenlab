const JSDOMEnvironment = require('jest-environment-jsdom').default;
const Module = require('module');

// Store the original require
const originalRequire = Module.prototype.require;

// Override Module.prototype.require globally before JSDOM loads
Module.prototype.require = function (id) {
  if (id === 'canvas' || (typeof id === 'string' && id.startsWith('canvas/'))) {
    // Return the mock instead of trying to load the real canvas
    const path = require('path');
    const mockPath = path.join(process.cwd(), '__mocks__', 'canvas.js');
    return originalRequire.call(this, mockPath);
  }
  return originalRequire.apply(this, arguments);
};

class JSDOMNoCanvasEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
  }
}

module.exports = JSDOMNoCanvasEnvironment;
