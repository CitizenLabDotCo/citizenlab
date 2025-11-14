import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import useAddContentBuilderLayout from 'api/content_builder/useAddContentBuilderLayout';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { contentBuilderLayoutData } from './__mocks__/contentBuilderLayout';

const apiPath =
  '*projects/:projectId/content_builder_layouts/project_description/upsert';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: contentBuilderLayoutData },
      { status: 200 }
    );
  })
);

describe('useAddContentBuilderLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddContentBuilderLayout(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        contentBuildableType: 'project',
        contentBuildableId: 'projectId',
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(contentBuilderLayoutData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddContentBuilderLayout(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        contentBuildableType: 'project',
        contentBuildableId: 'projectId',
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
