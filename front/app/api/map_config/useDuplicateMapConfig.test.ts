import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { mapConfigData } from './__mocks__/useMapConfig';
import useDuplicateMapConfig from './useDuplicateMapConfig';

const apiPath = '*/map_configs/:id/duplicate_map_config_and_layers';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mapConfigData }));
  })
);

describe('useDuplicateMapConfig', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDuplicateMapConfig(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(mapConfigData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDuplicateMapConfig(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
