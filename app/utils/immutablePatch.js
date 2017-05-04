import { Map } from 'immutable'

Map.prototype.reactMap = function(func) {
  this.reduce((out, ...reduceArgs) => (
    out.concat(func(reduceArgs))
  ), []);
};
