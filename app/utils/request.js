import 'whatwg-fetch';

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
// function parseJSON(response) {
//   return response.json();
// }

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
// function checkStatus(response) {
//   if (response.status >= 200 && response.status < 300) {
//     return response;
//   }
//
//   const error = new Error(response.statusText);
//   error.response = response;
//   throw error;
// }

export function getJwt() {
  try {
      return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0OTA5Nzk1NjQsInN1YiI6IjE5M2U1ODI4LTUwZDAtNDdiNS05NjNmLTQ5OTVkZmUyMzg3NiJ9.OWIM9qMJnrDPwHT4IRLWmT26Y8QJYmZMbuMM5P0n2DA';
    // TODO: after merge with master remove the previous line and uncomment the following one
    // return window.localStorage.getItem('jwt');
  } catch (err) {
    console.log("[DEBUG] err =", err); // eslint-disable-line
    return null;
  }
}

export function setJwt(jwt) {
  window.localStorage.setItem('jwt', jwt);
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export default function request(url, data, options) {
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
  return fetch(url, Object.assign(defaultOptions, options))
    .then((response) => {
      console.log(response);
      Promise.all([response, response.json()])
    })
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
