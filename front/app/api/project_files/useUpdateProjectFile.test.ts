import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { projectFilesData } from './__mocks__/useProjectFiles';
import useUpdateProjectFile from './useUpdateProjectFile';

const apiPath = '*projects/:projectId/files/:fileId';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: projectFilesData[0] }, { status: 200 });
  })
);

describe('useUpdateProjectFile', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateProjectFile(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'project_id',
        fileId: '158898ed-46b6-4527-ad8b-096604b4de2d',
        file: {
          ordering: 3,
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(projectFilesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateProjectFile(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        projectId: 'project_id',
        fileId: '158898ed-46b6-4527-ad8b-096604b4de2d',
        file: {
          ordering: 3,
        },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
