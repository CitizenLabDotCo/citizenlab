import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { IAPIClientResponse } from './types';
import useAddApiClient from './useAddApiClient';

const response: IAPIClientResponse = {
  data: {
    id: '1',
    type: 'api_client_unmasked',
    attributes: {
      secret: 'test',
    },
  },
};

const apiPath = '*api_clients';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: response }, { status: 200 });
  })
);

describe('useAddApiClient', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddApiClient(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        name: 'name',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(response);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddApiClient(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        name: 'name',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
