import { stringify } from 'qs';

import { getJwt } from 'utils/auth/jwt';

// we use xhr rather than fetch API, to enforce response type
export function requestBlob(
  url: string,
  type:
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'text/calendar'
    | 'application/geo+json'
    | 'application/pdf',
  queryParametersObject?,
  // Pass a body to send it as a JSON POST instead of the default GET.
  options?: { method?: 'GET' | 'POST'; body?: Record<string, unknown> }
): Promise<Blob> {
  const urlParams = stringify(queryParametersObject, {
    arrayFormat: 'brackets',
    addQueryPrefix: true,
  });
  const urlWithParams = `${url}${urlParams}`;
  const body = options?.body;
  const hasBody = body !== undefined;
  const method = options?.method ?? (hasBody ? 'POST' : 'GET');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, urlWithParams, true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('Content-Type', hasBody ? 'application/json' : type);
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
    xhr.send(hasBody ? JSON.stringify(body) : undefined);
  });
}
