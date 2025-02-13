import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { projectFolderFileData } from './__mocks__/useProjectFolderFiles';
import useAddProjectFolderFile from './useAddProjectFolderFile';

const apiPath = '*project_folders/:folderId/files';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: projectFolderFileData }, { status: 200 });
  })
);

describe('useAddProjectFolderFile', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddProjectFolderFile(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectFolderId: 'projectFolderId',
        file: 'file base 64',
        name: 'filename',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(projectFolderFileData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddProjectFolderFile(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectFolderId: 'projectFolderId',
        file: 'file base 64',
        name: 'filename',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
