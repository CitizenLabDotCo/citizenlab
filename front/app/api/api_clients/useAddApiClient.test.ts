import { renderHook, act } from '@testing-library/react-hooks';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
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
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: response }));
  })
);

describe('useAddApiClient', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddApiClient(), {
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddApiClient(), {
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
