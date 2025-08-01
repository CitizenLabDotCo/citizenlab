import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useDeleteMapLayer from './useDeleteMapLayer';
const apiPath = '*/map_configs/:mapConfigId/layers/:id';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDeleteMapLayer', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useDeleteMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'id', mapConfigId: 'mapConfigId' });
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      http.delete(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDeleteMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'id', mapConfigId: 'mapConfigId' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
