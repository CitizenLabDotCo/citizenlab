import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useApproveProject from './useApproveProject';

const apiPath = '*projects/:id/review';

const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: {} }, { status: 200 });
  })
);

describe('useApproveProject', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useApproveProject(), {
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
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useApproveProject(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('projectId');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
