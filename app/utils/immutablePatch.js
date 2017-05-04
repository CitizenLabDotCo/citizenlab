/* eslint-disable */
import { Map } from 'immutable';

Map.prototype.reactMap = function(func) {
  return this.reduce((out, ...reduceArgs) => out.concat(func(...reduceArgs)), []);
};
