import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useDeleteIdeaImage from './useDeleteIdeaImage';
const apiPath = '*ideas/:ideaId/images/:imageId';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDeleteIdeaImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteIdeaImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
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

    const { result, waitFor } = renderHook(() => useDeleteIdeaImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        imageId: 'imageId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
