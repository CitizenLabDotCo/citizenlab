import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useDeleteEventImage from './useDeleteEventImage';
const apiPath = '*/events/:eventId/images/:imageId';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDeleteEventImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useDeleteEventImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ eventId: 'eventId', imageId: 'imageId' });
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      http.delete(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDeleteEventImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ eventId: 'eventId', imageId: 'imageId' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
