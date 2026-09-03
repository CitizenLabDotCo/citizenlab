import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { eventsData } from './__mocks__/useEvents';
import useEvents from './useEvents';

const apiPath = '*events';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: eventsData }, { status: 200 });
  })
);

describe('useEvents', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () =>
        useEvents({
          projectIds: ['dummyId'],
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(eventsData);
  });

  it('sends the project dimensions a custom page can filter by', async () => {
    let requested = '';
    server.use(
      http.get(apiPath, ({ request }) => {
        requested = request.url;
        return HttpResponse.json({ data: eventsData }, { status: 200 });
      })
    );

    const { result } = renderHook(
      () =>
        useEvents({
          areas: ['area-1'],
          globalTopics: ['tag-1'],
          spaces: ['space-1'],
        }),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(decodeURIComponent(requested)).toContain('areas[]=area-1');
    expect(decodeURIComponent(requested)).toContain('global_topics[]=tag-1');
    expect(decodeURIComponent(requested)).toContain('spaces[]=space-1');
  });

  it('sends no dimension params when none are given', async () => {
    let requested = '';
    server.use(
      http.get(apiPath, ({ request }) => {
        requested = request.url;
        return HttpResponse.json({ data: eventsData }, { status: 200 });
      })
    );

    const { result } = renderHook(() => useEvents({}), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(requested).not.toContain('areas');
    expect(requested).not.toContain('global_topics');
    expect(requested).not.toContain('spaces');
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useEvents({
          projectIds: ['dummyId'],
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
