import { reportError } from 'utils/loggingUtils';

import fetcher from './fetcher';

jest.mock('utils/loggingUtils', () => ({ reportError: jest.fn() }));

const mockReportError = reportError as jest.Mock;

const baseDataArray = {
  data: [
    { id: 1, type: 'resource' },
    { id: 2, type: 'resource' },
  ],
};

const baseDataObject = {
  data: { id: 1, type: 'resource' },
};

const baseErrorObject = { errors: [{ error: 'error' }] };

let mockStatus = 200;
let mockOk = true;
let mockDataObject: any = baseDataObject;
let mockJsonParseFails = false;

global.fetch = jest.fn(() =>
  Promise.resolve({
    status: mockStatus,
    statusText: 'OK',
    ok: mockOk,
    json: () =>
      mockJsonParseFails
        ? Promise.reject(new SyntaxError('Unexpected token < in JSON'))
        : Promise.resolve(mockDataObject),
  } as Response)
);

let mockSetQueryData;

jest.mock('utils/cl-react-query/queryClient', () => {
  mockSetQueryData = jest.fn();
  return {
    queryClient: { setQueryData: mockSetQueryData },
  };
});

describe('fetcher', () => {
  describe('GET', () => {
    it('works correctly with a GET request with single resource', async () => {
      const result = await fetcher({ path: '/path', action: 'get' });

      expect(result).toEqual(baseDataObject);
    });

    it('works correctly with a GET request for collection of resources', async () => {
      mockDataObject = baseDataArray;

      const result = await fetcher({ path: '/path', action: 'get' });

      expect(result).toEqual(baseDataArray);

      // setQueryData is called with the correct query keys
      expect(mockSetQueryData).toHaveBeenCalledTimes(2);
      expect(mockSetQueryData).toHaveBeenNthCalledWith(
        1,
        [{ operation: 'item', type: 'resource', parameters: { id: 1 } }],
        expect.anything()
      );
      expect(mockSetQueryData).toHaveBeenNthCalledWith(
        2,
        [{ operation: 'item', type: 'resource', parameters: { id: 2 } }],
        expect.anything()
      );
    });

    it('works correctly with a GET request for collection of resources when cache optimization is disabled', async () => {
      mockDataObject = baseDataArray;

      const result = await fetcher({
        path: '/path',
        action: 'get',
        cacheIndividualItems: false,
      });

      expect(result).toEqual(baseDataArray);

      // setQueryData is called with the correct query keys
      expect(mockSetQueryData).toHaveBeenCalledTimes(0);
    });

    it('works correctly with a GET request on error', async () => {
      mockStatus = 404;
      mockOk = false;
      mockDataObject = baseErrorObject;

      let thrownError: typeof baseErrorObject | undefined;

      try {
        await fetcher({ path: '/path', action: 'get' });
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toEqual(baseErrorObject);
    });
  });
  describe('POST', () => {
    it('works correctly with a POST request', async () => {
      mockStatus = 200;
      mockDataObject = baseDataObject;
      mockOk = true;
      const result = await fetcher({
        path: '/path',
        action: 'post',
        body: baseDataObject,
      });

      expect(result).toEqual(baseDataObject);

      expect(mockSetQueryData).toHaveBeenNthCalledWith(
        1,
        [{ operation: 'item', type: 'resource', parameters: { id: 1 } }],
        expect.anything()
      );
    });
    it('works correctly with a POST request on error', async () => {
      mockStatus = 404;
      mockOk = false;
      mockDataObject = baseErrorObject;

      let thrownError: typeof baseErrorObject | undefined;

      try {
        await fetcher({
          path: '/path',
          action: 'post',
          body: baseDataObject,
        });
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toEqual(baseErrorObject);
    });
  });
  describe('PATCH', () => {
    it('works correctly with a PATCH request', async () => {
      mockStatus = 200;
      mockDataObject = baseDataObject;
      mockOk = true;
      const result = await fetcher({
        path: '/path',
        action: 'patch',
        body: baseDataObject,
      });

      expect(result).toEqual(baseDataObject);

      expect(mockSetQueryData).toHaveBeenNthCalledWith(
        1,
        [{ operation: 'item', type: 'resource', parameters: { id: 1 } }],
        expect.anything()
      );
    });
    it('works correctly with a PATCH request on error', async () => {
      mockStatus = 404;
      mockOk = false;
      mockDataObject = baseErrorObject;

      let thrownError: typeof baseErrorObject | undefined;

      try {
        await fetcher({
          path: '/path',
          action: 'patch',
          body: baseDataObject,
        });
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toEqual(baseErrorObject);
    });
  });
  describe('DELETE', () => {
    it('works correctly with a DELETE request', async () => {
      mockStatus = 200;
      mockDataObject = baseDataObject;
      mockOk = true;
      const result = await fetcher({
        path: '/path',
        action: 'delete',
      });

      expect(result).toEqual(null);
    });
    it('works correctly with a DELETE request on error', async () => {
      mockStatus = 404;
      mockOk = false;
      mockDataObject = baseErrorObject;

      let thrownError: typeof baseErrorObject | undefined;

      try {
        await fetcher({ path: '/path', action: 'delete' });
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toEqual(baseErrorObject);
    });
  });

  describe('error reporting', () => {
    const fetchAndCatch = async () => {
      try {
        await fetcher({ path: '/path', action: 'get' });
      } catch {
        // The fetcher always throws on error; these tests are about what it reports.
      }
    };

    beforeEach(() => {
      mockReportError.mockClear();
      mockJsonParseFails = false;
      mockDataObject = baseDataObject;
    });

    it.each([401, 403, 404])(
      'does not report a %i, which is an expected response',
      async (status) => {
        mockStatus = status;
        mockOk = false;
        mockDataObject = { message: "Couldn't find Project" };

        await fetchAndCatch();

        expect(mockReportError).not.toHaveBeenCalled();
      }
    );

    it('reports an unexpected error status without a structured error body', async () => {
      mockStatus = 500;
      mockOk = false;
      mockDataObject = { message: 'Internal Server Error' };

      await fetchAndCatch();

      expect(mockReportError).toHaveBeenCalledWith(mockDataObject);
    });

    it('does not report an error the back-end already described', async () => {
      mockStatus = 422;
      mockOk = false;
      mockDataObject = { errors: { base: [{ error: 'invalid' }] } };

      await fetchAndCatch();

      expect(mockReportError).not.toHaveBeenCalled();
    });

    it('does not report an unparseable body on a failed response', async () => {
      mockStatus = 502;
      mockOk = false;
      mockJsonParseFails = true;

      await fetchAndCatch();

      expect(mockReportError).not.toHaveBeenCalled();
    });

    it('reports an unparseable body on a successful response', async () => {
      mockStatus = 200;
      mockOk = true;
      mockJsonParseFails = true;

      await fetchAndCatch();

      expect(mockReportError).toHaveBeenCalledWith(
        'Unsupported case. No valid JSON.'
      );
    });
  });
});
