/**
 * Removes all undefined and null values from an object
 * @example
 * // returns {a: 1}
 * compactObject({a: 1, b: undefined, c: null})
 */
export function compactObject(obj): object {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && obj[key] !== null) acc[key] = obj[key];
    return acc;
  }, {});
}

/**
 * Checks if an object is empty, i.e. has no own properties
 * @example
 * // returns true
 * isEmpty({})
 * @example
 * // returns false
 * isEmpty({a: 1})
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
