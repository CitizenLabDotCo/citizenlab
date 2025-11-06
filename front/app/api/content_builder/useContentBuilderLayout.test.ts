import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { contentBuilderLayoutData } from './__mocks__/contentBuilderLayout';

const projectApiPath =
  '*/projects/:projectId/content_builder_layouts/project_description';
const folderApiPath =
  '*/project_folders/:folderId/content_builder_layouts/project_folder_description';
const homepageApiPath = '*home_pages/content_builder_layouts/homepage';

const server = setupServer(
  http.get(projectApiPath, () => {
    return HttpResponse.json(
      { data: contentBuilderLayoutData },
      { status: 200 }
    );
  })
);

describe('useContentBuilderLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly for a project', async () => {
    const spy = jest.spyOn(global, 'fetch');
    const { result } = renderHook(
      () => useContentBuilderLayout('project', 'projectId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(contentBuilderLayoutData);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns data correctly for a folder', async () => {
    server.use(
      http.get(folderApiPath, () => {
        return HttpResponse.json(
          { data: contentBuilderLayoutData },
          { status: 200 }
        );
      })
    );

    const spy = jest.spyOn(global, 'fetch');
    const { result } = renderHook(
      () => useContentBuilderLayout('folder', 'folderId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(contentBuilderLayoutData);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns data correctly for the homepage', async () => {
    server.use(
      http.get(homepageApiPath, () => {
        return HttpResponse.json(
          { data: contentBuilderLayoutData },
          { status: 200 }
        );
      })
    );

    const spy = jest.spyOn(global, 'fetch');
    const { result } = renderHook(
      () => useContentBuilderLayout('folder', 'folderId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(contentBuilderLayoutData);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(projectApiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useContentBuilderLayout('project', 'projectId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('does not make API call when enabled is false', async () => {
    const spy = jest.spyOn(global, 'fetch');
    renderHook(() => useContentBuilderLayout('project', 'projectId', false), {
      wrapper: createQueryClientWrapper(),
    });

    expect(spy).not.toHaveBeenCalled();
  });
});
