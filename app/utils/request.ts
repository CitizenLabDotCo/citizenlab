import 'whatwg-fetch';
import { stringify } from 'qs';
import { getJwt } from 'utils/auth/jwt';
import { isString } from 'lodash-es';

export default function request<T>(
  url,
  data,
  options,
  queryParameters
): Promise<T> {
  const urlParams = stringify(queryParameters, {
    arrayFormat: 'brackets',
    addQueryPrefix: true,
  });
  const urlWithParams = `${url}${urlParams}`;
  const jwt = getJwt();
  const defaultOptions: { [key: string]: any } = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (jwt) {
    defaultOptions.headers['Authorization'] = `Bearer ${jwt}`;
  }

  if (data) {
    defaultOptions.body = JSON.stringify(data);
  }

  return fetch(urlWithParams, { ...defaultOptions, ...options })
    .then((response) => {
      return Promise.all([
        response,
        response.json().catch(() => {
          if (response.ok || response.status === 404) return {};
          return new Error('Unsupported case. No valid JSON.');
        }),
      ]);
    })
    .then((result) => {
      const response = result[0];
      const json = result[1];

      if (response.ok || response.status === 200) {
        return json;
      }

      const errorMessage = isString(json?.error)
        ? json.error
        : response.statusText || 'unknown error';
      throw new Error(`error for ${urlWithParams}: ${errorMessage}`);
    })
    .catch((error) => {
      throw new Error(
        `error for ${urlWithParams}: ${error || 'unknown error'}`
      );
    });
}

// we use xhr rather than fetch API, to enforce response type
export function requestBlob(url, type, queryParametersObject?): Promise<Blob> {
  const urlParams = stringify(queryParametersObject, {
    arrayFormat: 'brackets',
    addQueryPrefix: true,
  });
  const urlWithParams = `${url}${urlParams}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', urlWithParams, true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('Content-Type', type);
    xhr.setRequestHeader('Authorization', `Bearer ${getJwt()}`);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = new Blob([xhr.response], { type });
        resolve(blob);
      } else {
        const error = new Error(xhr.statusText);
        reject(error);
      }
    };
    xhr.send(undefined);
  });
}
