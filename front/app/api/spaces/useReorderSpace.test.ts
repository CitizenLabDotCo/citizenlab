import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, act, waitFor } from 'utils/testUtils/rtl';

import { SpaceData } from './types';
import useReorderSpace from './useReorderSpace';

const space: SpaceData = {
  id: 'space-1',
  type: 'space',
  attributes: {
    title_multiloc: { en: 'Mobility' },
    description_multiloc: {},
    ordering: 0,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  relationships: { moderators: { data: [] } },
};

const apiPath = '*spaces/:id/reorder';
let requestBody: unknown;
const server = setupServer(
  http.patch(apiPath, async ({ request }) => {
    requestBody = await request.json();
    return HttpResponse.json({ data: space }, { status: 200 });
  })
);

describe('useReorderSpace', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useReorderSpace(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'space-1', ordering: 1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(space);
    expect(requestBody).toEqual({ space: { ordering: 1 } });
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => HttpResponse.json(null, { status: 500 }))
    );

    const { result } = renderHook(() => useReorderSpace(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'space-1', ordering: 1 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
