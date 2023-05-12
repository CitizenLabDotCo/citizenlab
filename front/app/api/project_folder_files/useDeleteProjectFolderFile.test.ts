import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteProjectFolderFile from './useDeleteProjectFolderFile';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*project_folders/:folderId/files/:fileId';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
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
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
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
