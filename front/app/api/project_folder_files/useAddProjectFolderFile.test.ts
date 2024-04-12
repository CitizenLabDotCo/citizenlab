import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { projectFolderFileData } from './__mocks__/useProjectFolderFiles';
import useAddProjectFolderFile from './useAddProjectFolderFile';

const apiPath = '*project_folders/:folderId/files';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: projectFolderFileData }));
  })
);

describe('useAddProjectFolderFile', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddProjectFolderFile(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddProjectFolderFile(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        projectFolderId: 'projectFolderId',
        file: 'file base 64',
        name: 'filename',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });
});
