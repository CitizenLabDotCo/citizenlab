import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import endpoints, {
  projectImagesPath,
  projectImagesData,
} from './__mocks__/_mockServer';
import useAddProjectImage from './useAddProjectImage';

const server = setupServer(endpoints['POST projects/:projectId/images']);

describe('useAddProjectImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddProjectImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'projectId',
        image: { image: 'testbase64' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(projectImagesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(projectImagesPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddProjectImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'projectId',
        image: { image: 'testbase64' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
