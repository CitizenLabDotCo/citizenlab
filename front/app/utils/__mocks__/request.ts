const responses = {};

const getKey = (
  url: string,
  params: Record<string, any> | null,
  bodyData: Record<string, any> | null
) => {
  return `${url}${JSON.stringify(params)}${JSON.stringify(bodyData)}`;
};

export const __setResponseFor = (
  url: string,
  params: Record<string, any> | null,
  bodyData: Record<string, any> | null,
  payload: Record<string, any>
) => {
  const key = getKey(url, params, bodyData);
  responses[key] = payload;
};

export const requestBlob = jest.fn();

export const requestBlobPost = jest.fn();

export default jest.fn(
  (url, bodyData, _options, queryParameters): Promise<any> => {
    return new Promise((resolve, _reject) => {
      const key = getKey(url, queryParameters, bodyData);
      resolve(responses[key]);
    });
  }
);
