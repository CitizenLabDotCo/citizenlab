import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { customPagesData } from './__mocks__/useCustomPages';
import useCustomPages from './useCustomPages';

const apiPath = '*/static_pages';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: customPagesData }, { status: 200 });
  })
);

describe('useCustomPages', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useCustomPages(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(customPagesData);
  });

  it('passes the project_id query param when projectId is given', async () => {
    let requestedUrl = '';
    server.use(
      http.get(apiPath, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ data: customPagesData }, { status: 200 });
      })
    );

    const { result } = renderHook(
      () => useCustomPages({ projectId: 'project-1' }),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestedUrl).toContain('project_id=project-1');
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useCustomPages(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
