import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { eventImageData } from './__mocks__/useAddEventImage';
import useUpdateEventImage from './useUpdateEventImage';

const apiPath = '*/events/:eventId/images/:imageId';

const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: eventImageData }, { status: 200 });
  })
);

describe('useUpdateEventImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateEventImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        eventId: 'id',
        imageId: 'imageId',
        image: {
          image: '',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(eventImageData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateEventImage(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        eventId: 'id',
        imageId: 'imageId',
        image: {
          image: '',
        },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
