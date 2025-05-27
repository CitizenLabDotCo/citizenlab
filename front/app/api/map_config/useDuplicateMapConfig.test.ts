import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { mapConfigData } from './__mocks__/useMapConfig';
import useDuplicateMapConfig from './useDuplicateMapConfig';

const apiPath = '*/map_configs/:id/duplicate_map_config_and_layers';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: mapConfigData }, { status: 200 });
  })
);

describe('useDuplicateMapConfig', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useDuplicateMapConfig(), {
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
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDuplicateMapConfig(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
