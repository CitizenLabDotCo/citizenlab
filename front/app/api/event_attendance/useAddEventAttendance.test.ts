import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { eventAttendanceData } from './__mocks__/useEventAttendance';
import useAddEventAttendance from './useAddEventAttendance';

const apiPath = '*/events/:eventId/attendances';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: eventAttendanceData }, { status: 200 });
  })
);

describe('useAddEventAttendance', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddEventAttendance('eventId'), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ attendeeId: 'attendeeId', eventId: 'eventId' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(eventAttendanceData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddEventAttendance('eventId'), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({ attendeeId: 'attendeeId', eventId: 'eventId' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
