import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { trackCustomerAnalyticsEvent } from 'utils/analytics';
import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { followersData } from './__mocks__/useFollowers';
import useAddFollower from './useAddFollower';

jest.mock('utils/analytics', () => ({
  ...jest.requireActual('utils/analytics'),
  trackCustomerAnalyticsEvent: jest.fn(),
}));

const apiPath = '*followers';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: followersData[0] }, { status: 200 });
  })
);

describe('useAddFollower', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddFollower(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        followableType: 'ideas',
        followableId: '1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(followersData[0]);
  });

  it.each([
    ['ideas', 'idea_followed', { idea_id: '1' }],
    ['projects', 'project_followed', { project_id: '1' }],
  ] as const)(
    'tracks following %s as %s',
    async (followableType, eventName, properties) => {
      jest.mocked(trackCustomerAnalyticsEvent).mockClear();
      const { result } = renderHook(() => useAddFollower(), {
        wrapper: createQueryClientWrapper(),
      });

      act(() => {
        result.current.mutate({ followableType, followableId: '1' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(trackCustomerAnalyticsEvent).toHaveBeenCalledWith(
        eventName,
        properties
      );
    }
  );

  it('does not track following other types', async () => {
    jest.mocked(trackCustomerAnalyticsEvent).mockClear();
    const { result } = renderHook(() => useAddFollower(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ followableType: 'areas', followableId: '1' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(trackCustomerAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddFollower(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        followableType: 'ideas',
        followableId: '1',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
