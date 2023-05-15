import { renderHook, act } from '@testing-library/react-hooks';

import useAddProjectFolderImage from './useAddProjectFolderImage';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { projectFolderImageData } from './__mocks__/useProjectFolderImages';

const apiPath = '*project_folders/:folderId/images';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: projectFolderImageData }));
  })
);

describe('useAddProjectFolderImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddProjectFolderImage(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        folderId: 'projectFolderId',
        base64: 'file base 64',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(projectFolderImageData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddProjectFolderImage(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        folderId: 'projectFolderId',
        base64: 'file base 64',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });
});
