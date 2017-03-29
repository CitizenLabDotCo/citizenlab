import 'whatwg-fetch';

const API_PATH = 'http://localhost:4000/api/v1';

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  return response.json();
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export default function request(url, options) {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON);
}

export function getCurrentUserRequest(options) {
  // TODO: replace userId with /me when available
  const userId = 'e672299d-e77e-464a-a5cc-41874c49e2f7';
  return fetch(`${API_PATH}/users/${userId}`, options)
    .then(checkStatus)
    .then(parseJSON);
}

export function getIdeasRequest(options) {
  return fetch(`${API_PATH}/ideas`, options)
    .then(checkStatus)
    .then(parseJSON);
}
