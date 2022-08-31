import { Streams } from '.';
// @ts-ignore
import _request, { __setResponseFor } from 'utils/request';
import { authApiEndpoint } from 'services/auth';
import { currentAppConfigurationEndpoint } from 'services/appConfiguration';

const request = _request as jest.MockedFunction<any>;

jest.mock('utils/request');
jest.mock('services/auth');
jest.mock('services/appConfiguration');
jest.mock('modules', () => ({ streamsToReset: [] }));

let streams: Streams;

// Dummy responses
const dummyAppConfig = {
  data: { id: 'auth-id', type: 'app_configuration', attributes: {} },
};
__setResponseFor(currentAppConfigurationEndpoint, null, dummyAppConfig);

const dummyAuth = {
  data: { id: 'auth-id', type: 'user', attributes: {} },
};
__setResponseFor(authApiEndpoint, null, dummyAuth);

const dummyTest = {
  data: { id: 'test-id', type: 'test', attributes: {} },
};
__setResponseFor('/web_api/v1/test', null, dummyTest);

const dummyParamTestTrue = {
  data: [
    { id: 'param-id-1', type: 'param_test', attributes: {} },
    { id: 'param-id-2', type: 'param_test', attributes: {} },
  ],
};

__setResponseFor(
  '/web_api/v1/param_test',
  { some_param: true },
  dummyParamTestTrue
);

const dummyParamTestFalse = {
  data: [
    { id: 'param-id-3', type: 'param_test', attributes: {} },
    { id: 'param-id-4', type: 'param_test', attributes: {} },
  ],
};

__setResponseFor(
  '/web_api/v1/param_test',
  { some_param: false },
  dummyParamTestFalse
);

describe('streams.get', () => {
  beforeEach(async () => {
    streams = new Streams();

    // fetch app config and auth, always need to be available
    // (see .reset method)
    await streams.get({ apiEndpoint: currentAppConfigurationEndpoint });
    await streams.get({ apiEndpoint: authApiEndpoint });
    jest.clearAllMocks();
  });

  describe('without params', () => {
    it('returns response in subscription of observable', async () => {
      const { observable } = await streams.get({
        apiEndpoint: '/web_api/v1/test',
      });

      expect(observable).not.toBeUndefined();

      let response;
      observable.subscribe((data) => {
        response = data;
      });

      expect(response).toEqual(dummyTest);
      expect(request).toHaveBeenCalledTimes(1);
    });

    it('caches stream', async () => {
      await streams.get({
        apiEndpoint: '/web_api/v1/test',
      });

      await streams.get({
        apiEndpoint: '/web_api/v1/test',
      });

      expect(request).toHaveBeenCalledTimes(1);
    });

    it('refetches when you reset and stream is active', async () => {
      const { observable } = await streams.get({
        apiEndpoint: '/web_api/v1/test',
      });

      expect(request.mock.calls).toEqual([
        ['/web_api/v1/test', null, { method: 'GET' }, null],
      ]);

      // Make stream active by subscribing to it
      observable.subscribe(() => {});

      await streams.reset();

      expect(request.mock.calls).toEqual([
        ['/web_api/v1/test', null, { method: 'GET' }, null],
        ['/web_api/v1/users/me', null, { method: 'GET' }, null],
        ['/web_api/v1/app_configuration', null, { method: 'GET' }, null],
        ['/web_api/v1/test', null, { method: 'GET' }, null],
      ]);
    });

    it('does not refetch when you reset and stream is not active', async () => {
      await streams.get({
        apiEndpoint: '/web_api/v1/test',
      });

      expect(request.mock.calls).toEqual([
        ['/web_api/v1/test', null, { method: 'GET' }, null],
      ]);

      await streams.reset();

      expect(request.mock.calls).toEqual([
        ['/web_api/v1/test', null, { method: 'GET' }, null],
        ['/web_api/v1/users/me', null, { method: 'GET' }, null],
        ['/web_api/v1/app_configuration', null, { method: 'GET' }, null],
      ]);
    });
  });

  describe('with params', () => {
    it('returns response in subscription of observable', async () => {
      const { observable: ob1 } = await streams.get({
        apiEndpoint: '/web_api/v1/param_test',
        queryParameters: {
          some_param: true,
        },
      });

      const { observable: ob2 } = await streams.get({
        apiEndpoint: '/web_api/v1/param_test',
        queryParameters: {
          some_param: false,
        },
      });

      let response1;
      let response2;

      ob1.subscribe((data) => {
        response1 = data;
      });
      ob2.subscribe((data) => {
        response2 = data;
      });

      expect(response1).toEqual(dummyParamTestTrue);
      expect(response2).toEqual(dummyParamTestFalse);
    });

    it('caches stream with same params', async () => {
      await streams.get({
        apiEndpoint: '/web_api/v1/param_test',
        queryParameters: {
          some_param: true,
        },
      });

      await streams.get({
        apiEndpoint: '/web_api/v1/param_test',
        queryParameters: {
          some_param: true,
        },
      });

      expect(request).toHaveBeenCalledTimes(1);
    });

    it('does not cache stream with different params', async () => {
      await streams.get({
        apiEndpoint: '/web_api/v1/param_test',
        queryParameters: {
          some_param: true,
        },
      });

      await streams.get({
        apiEndpoint: '/web_api/v1/param_test',
        queryParameters: {
          some_param: false,
        },
      });

      expect(request).toHaveBeenCalledTimes(2);
    });

    // it('refetches both active streams on reset', async () => {
    //   const { observable: ob1 } = await streams.get({
    //     apiEndpoint: '/web_api/v1/param_test',
    //     queryParameters: {
    //       some_param: true
    //     }
    //   });

    //   const { observable: ob2 } = await streams.get({
    //     apiEndpoint: '/web_api/v1/param_test',
    //     queryParameters: {
    //       some_param: false
    //     }
    //   });

    //   ob1.subscribe(() => {});
    //   ob2.subscribe(() => {});

    //   expect(request.mock.calls).toEqual([

    //   ]);

    //   await streams.get({
    //     apiEndpoint: '/web_api/v1/param_test',
    //     queryParameters: {
    //       some_param: true
    //     }
    //   });

    //   await streams.get({
    //     apiEndpoint: '/web_api/v1/param_test',
    //     queryParameters: {
    //       some_param: false
    //     }
    //   });

    //   expect(request.mock.calls).toEqual([

    //   ]);
    // });
  });
});

describe('streams.fetchAllWith', () => {});
