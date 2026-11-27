import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { eventAttendanceData } from './__mocks__/useEventAttendance';
import useEventAttendances from './useEventAttendances';

const apiPath = '*events/:eventId/attendances';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      {
        data: [eventAttendanceData],
        included: [],
        links: {},
        meta: { total: 1, unfiltered_total: 1 },
      },
      { status: 200 }
    );
  })
);

describe('useEventAttendances', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useEventAttendances('eventId'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual([eventAttendanceData]);
  });

  it('passes filters, sorting and pagination to the endpoint', async () => {
    let requestUrl: URL | undefined;
    server.use(
      http.get(apiPath, ({ request }) => {
        requestUrl = new URL(request.url);
        return HttpResponse.json({
          data: [],
          included: [],
          links: {},
          meta: { total: 0, unfiltered_total: 0 },
        });
      })
    );
    const { result } = renderHook(
      () =>
        useEventAttendances('eventId', {
          search: 'Sam',
          sort: '-created_at',
          registered: 'earlier',
          'page[number]': 2,
          'page[size]': 20,
        }),
      { wrapper: createQueryClientWrapper() }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestUrl?.searchParams.get('search')).toBe('Sam');
    expect(requestUrl?.searchParams.get('registered')).toBe('earlier');
    expect(requestUrl?.searchParams.get('sort')).toBe('-created_at');
    expect(requestUrl?.searchParams.get('page[number]')).toBe('2');
    expect(requestUrl?.searchParams.get('page[size]')).toBe('20');
  });

  it('does not request attendances for an unsaved event', () => {
    const { result } = renderHook(() => useEventAttendances(), {
      wrapper: createQueryClientWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isLoading).toBe(false);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventAttendances('eventId'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
