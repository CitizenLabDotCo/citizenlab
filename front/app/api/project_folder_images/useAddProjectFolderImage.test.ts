import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { projectFolderImageData } from './__mocks__/useProjectFolderImages';
import useAddProjectFolderImage from './useAddProjectFolderImage';

const apiPath = '*project_folders/:folderId/images';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: projectFolderImageData }, { status: 200 });
  })
);

describe('useAddProjectFolderImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddProjectFolderImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
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
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddProjectFolderImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        folderId: 'projectFolderId',
        base64: 'file base 64',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
