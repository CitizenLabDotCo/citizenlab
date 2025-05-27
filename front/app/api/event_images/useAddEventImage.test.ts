import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { eventImageData } from './__mocks__/useAddEventImage';
import useAddEventImage from './useAddEventImage';

const apiPath = '*/events/:eventId/images';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: eventImageData }, { status: 200 });
  })
);

describe('useAddEventImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddEventImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        eventId: 'id',
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
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddEventImage(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        eventId: 'id',
        image: {
          image: '',
        },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
