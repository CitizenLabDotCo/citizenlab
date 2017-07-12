import 'whatwg-fetch';
import * as withQuery from 'with-query';
import { getJwt } from 'utils/auth/jwt';

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export default function request(url, data, options, queryParameters) {
  const jwt = getJwt();
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (jwt) {
    defaultOptions.headers['Authorization'] = `Bearer ${jwt}`; // eslint-disable-line
  }

  if (data) {
    defaultOptions.body = JSON.stringify(data);
  }

  const urlWithParams = (queryParameters ? withQuery(url, queryParameters) : url);

  return fetch(urlWithParams, Object.assign(defaultOptions, options))
    .then((response) => (
      Promise.all([
        response,
        response.json().catch(() => {
          if (response.ok) return {};
          return new Error('Unsupported case. No valid JSON.');
        }),
      ])
    ))
    .then((result) => {
      const response = result[0];
      const json = result[1];

      if (response.ok) {
        return json;
      }

      const error = new Error(response.statusText);
      error.json = json;
      throw error;
    });
}
