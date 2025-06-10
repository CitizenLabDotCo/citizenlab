import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useCopyProject from './useCopyProject';

const apiPath = '*projects/:projectId/copy';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: {} }, { status: 200 });
  })
);

describe('useCopyProject', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useCopyProject(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('projectId');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual({});
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useCopyProject(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('projectId');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
