import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useDeleteProjectFolderImage from './useDeleteProjectFolderImage';

const apiPath = '*project_folders/:folderId/images/:imageId';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDeleteProjectFolderImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useDeleteProjectFolderImage(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    await act(async () => {
      result.current.mutate({
        folderId: 'folderId',
        imageId: 'imageId',
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

    const { result, waitFor } = renderHook(
      () => useDeleteProjectFolderImage(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    await act(async () => {
      result.current.mutate({
        folderId: 'folderId',
        imageId: 'imageId',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });
});
