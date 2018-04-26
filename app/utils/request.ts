import 'whatwg-fetch';
import * as withQuery from 'with-query';
import qs from 'qs';
import { getJwt } from 'utils/auth/jwt';

export default async function request<T>(url, data, options, queryParameters): Promise<T> {
  const urlParams = qs.stringify(queryParameters, { arrayFormat: 'brackets', addQueryPrefix: true });
  const urlWithParams = `${url}${urlParams}`;
  const jwt = getJwt();
  const defaultOptions: { [key: string]: any } = {
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (jwt) {
    defaultOptions.headers['Authorization'] = `Bearer ${jwt}`; // eslint-disable-line
  }

  if (data) {
    defaultOptions.body = JSON.stringify(data);
  }

  // let response: Response = null as any;
  // let json: Promise<any> = {} as any;

  // try {
  //   response = await fetch(urlWithParams, { ...defaultOptions, ...options });
  //   json = await response.json();

  //   if (response.ok !== true) {
  //     throw new Error('fetch error');
  //   }

  //   return json;
  // } catch {
  //   const status = response.statusText || response.status.toString();
  //   throw { status, response, json };
  // }

  return fetch(urlWithParams, Object.assign(defaultOptions, options)).then((response) => {
    return Promise.all([
      response,
      response.json().catch(() => {
        if (response.ok || response.status === 404) return {};
        return new Error('Unsupported case. No valid JSON.');
      })
    ]);
  }).then((result) => {
    const response = result[0];
    const json = result[1];

    if (response.ok) {
      return json;
    }

    const error = new Error(response.statusText);
    throw { ...error, json };
  });
}

// we use xhr rather than fetch API, to enforce response type
export function requestBlob(url, type, queryParameters?) {
  const urlWithParams = (queryParameters ? withQuery(url, queryParameters) : url);

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
    xhr.send(null);
  });
}
