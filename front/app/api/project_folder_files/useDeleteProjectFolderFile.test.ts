import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useDeleteProjectFolderFile from './useDeleteProjectFolderFile';

const apiPath = '*project_folders/:folderId/files/:fileId';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDeleteProjectFolderFile', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteProjectFolderFile(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        projectFolderId: 'folderId',
        fileId: 'fileId',
      });
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      http.delete(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteProjectFolderFile(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        projectFolderId: 'projectFolderId',
        fileId: 'fileId',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });
});
