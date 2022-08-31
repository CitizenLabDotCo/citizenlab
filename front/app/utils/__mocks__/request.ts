const responses = {};

export const __setResponseFor = (url, params, payload) => {
  responses[`${url}${JSON.stringify(params)}`] = payload;
};

export const requestBlob = jest.fn();

export const requestBlobPost = jest.fn();

export default jest.fn(
  (url, _data, _options, queryParameters): Promise<any> => {
    return new Promise((resolve, _reject) => {
      resolve(responses[`${url}${JSON.stringify(queryParameters)}`]);
    });
  }
);
