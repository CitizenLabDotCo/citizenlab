import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { project1 } from './__mocks__/_mockServer';
import useRefreshProjectPreviewToken from './useRefreshProjectPreviewToken';

const apiPath = '*projects/:projectId/refresh_preview_token';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: project1 }, { status: 200 });
  })
);

describe('useRefreshProjectPreviewToken', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useRefreshProjectPreviewToken(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'id',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(project1);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useRefreshProjectPreviewToken(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        projectId: 'id',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
