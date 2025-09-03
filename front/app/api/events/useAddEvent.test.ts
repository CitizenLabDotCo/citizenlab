import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { eventsData } from './__mocks__/useEvents';
import useAddEvent from './useAddEvent';

const apiPath = '*/projects/:projectId/events';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: eventsData[0] }, { status: 200 });
  })
);

describe('useAddEvent', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddEvent(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'id',
        event: {
          start_at: '2023-03-02T09:51:00.324Z',
          end_at: '2023-03-02T09:51:00.398Z',
          title_multiloc: {
            en: 'New Event',
          },
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(eventsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddEvent(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        projectId: 'id',
        event: {
          start_at: '2023-03-02T09:51:00.324Z',
          end_at: '2023-03-02T09:51:00.398Z',
          title_multiloc: {
            en: 'New Event',
          },
        },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
