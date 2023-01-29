// utils
import {
  forOwn,
  isArray,
  isString,
  isObject,
  isEmpty,
  cloneDeep,
  isUndefined,
} from 'lodash-es';
import { isUUID } from 'utils/helperUtils';
import stringify from 'json-stable-stringify';

// typings
import { IObject } from '.';

// Here we recursively freeze each property in the object provided
// as the argument so that the return object is immutable (=read-only).
// This is a safety mechanism we apply to all objects being put in
// the streams to make sure that any given stream can
// be simultaneously subscribed to in different components with the guarantee that
// each component will receive the exact same data for that stream.
// If the stream data would not be immutable, you could in theory
// overwrite it in one place and (unknowingly) affect the data in other
// places that subscribe to that stream as well.
// By making the stream data immutable, you avoid this scenario.
export const deepFreeze = <T>(object: T): T => {
  let frozenObject = object;

  if (frozenObject && !Object.isFrozen(frozenObject)) {
    let property;
    let propertyKey;

    frozenObject = Object.freeze(object);

    for (propertyKey in frozenObject) {
      if (
        // eslint-disable-next-line no-prototype-builtins
        (frozenObject as Record<string, any>).hasOwnProperty(propertyKey)
      ) {
        property = frozenObject[propertyKey];

        if (
          typeof property !== 'object' ||
          !(property instanceof Object) ||
          Object.isFrozen(property)
        ) {
          continue;
        }

        deepFreeze(property);
      }
    }
  }

  return frozenObject;
};

// Here we sanitize endpoints with query parameters
// to normalize them (e.g. make sure any null, undefined or '' params
// do not get taken into account when determining if a stream for the given params already exists).
// The 'skipSanitizationFor' parameter can be used to provide
// a list of query parameter names that should not be sanitized
export const sanitizeQueryParameters = (
  queryParameters: IObject | null,
  skipSanitizationFor?: string[]
) => {
  const sanitizedQueryParameters = cloneDeep(queryParameters);

  forOwn(queryParameters, (value, key) => {
    if (
      !skipSanitizationFor?.includes(key) &&
      (isUndefined(value) ||
        (isString(value) && isEmpty(value)) ||
        (isArray(value) && isEmpty(value)) ||
        (isObject(value) && isEmpty(value)))
    ) {
      delete (sanitizedQueryParameters as IObject)[key];
    }
  });

  return isObject(sanitizedQueryParameters) &&
    !isEmpty(sanitizedQueryParameters)
    ? sanitizedQueryParameters
    : null;
};

// Remove trailing slash to normalize the api endpoint names.
// This is needed to avoid the creation of redundant streams for the same endpoint
// (e.g. when providing the endpoint both with and without trailing slash)
export const removeTrailingSlash = (apiEndpoint: string) => {
  return apiEndpoint.replace(/\/$/, '');
};

// Determines wether the stream is associated with an endpoint
// that return a single object (e.g. an idea endpoint)
// or an endpoint that returns a collection of objects (e.g. the ideas endpoint)
export const isSingleItemStream = (
  lastUrlSegment: string,
  isQueryStream: boolean
) => {
  if (!isQueryStream) {
    // When the endpoint url ends with a UUID we're dealing with a single-item endpoint
    return isUUID(lastUrlSegment);
  }

  return false;
};

// The streamId is the unique identifier for a stream, and is composed by
// the following data:
// - The api endpoint
// - An optional cache parameter set to false
// when the stream is not cached (not included when cacheStream is true)
// - Normalized and stringified query parameters (if any are present)
// Together these parameters will return a streamId in the form of a string.
export const getStreamId = (
  apiEndpoint: string,
  isQueryStream: boolean,
  queryParameters: IObject | null,
  cacheStream: boolean
) => {
  let streamId = apiEndpoint;

  if (!cacheStream) {
    streamId = `${streamId}?cached=${cacheStream}`;
  }

  if (queryParameters !== null && isQueryStream) {
    streamId = `${streamId}&${stringify(queryParameters)}`;
  }

  return streamId;
};
