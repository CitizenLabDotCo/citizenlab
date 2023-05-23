import { stringify } from 'qs';
import { getJwt } from 'utils/auth/jwt';
import { isString } from 'lodash-es';
import { IHttpMethod } from 'typings';
import { IObject } from 'utils/streams';
import { RequestError } from 'utils/requestError';
import { handleBlockedUserError } from 'utils/errorUtils';

export default function request<T>(
  url: string,
  bodyData: Record<string, any> | null,
  options: IHttpMethod | null,
  queryParameters: IObject | null
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

  if (bodyData) {
    defaultOptions.body = JSON.stringify(bodyData);
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
      handleBlockedUserError(response.status, json);
      const errorMessage = isString(json?.error)
        ? json.error
        : response.statusText || 'unknown error';
      const error = new RequestError(
        `error for ${urlWithParams}: ${errorMessage}`
      );
      error.statusCode = response.status;
      if (json) {
        // The error reasons may be encoded in the
        // json content (this happens e.g. for
        // xlsx invites).
        Object.assign(error, { json });
      }
      throw error;
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
