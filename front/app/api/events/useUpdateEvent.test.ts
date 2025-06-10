import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { eventsData } from './__mocks__/useEvents';
import useUpdateEvent from './useUpdateEvent';

const apiPath = '*events/:id';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: eventsData[0] }, { status: 200 });
  })
);

describe('useUpdateEvent', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateEvent(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        eventId: 'id',
        event: { title_multiloc: { en: 'name' } },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(eventsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateEvent(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        eventId: 'id',
        event: { title_multiloc: { en: 'name' } },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
