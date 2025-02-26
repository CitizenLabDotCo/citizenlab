import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { projectFolderImageData } from './__mocks__/useProjectFolderImages';
import useUpdateProjectFolderImage from './useUpdateProjectFolderImage';

const apiPath = '*project_folders/:folderId/images/:imageId';

const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: projectFolderImageData }, { status: 200 });
  })
);

describe('useUpdateProjectFolderImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateProjectFolderImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        folderId: 'projectFolderId',
        base64: 'file base 64',
        imageId: 'imageId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(projectFolderImageData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateProjectFolderImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        folderId: 'projectFolderId',
        base64: 'file base 64',
        imageId: 'imageId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
