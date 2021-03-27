
const responses = {};

export const __setResponseFor = (url, payload) => {
  responses[url] = payload;
};

export default jest.fn((url, _data, _options, _queryParameters): Promise<any>  => {
  return new Promise((resolve, _reject) => {
    resolve(responses[url]);
  });
});
