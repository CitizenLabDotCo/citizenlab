import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { trackCustomerAnalyticsEvent } from 'utils/analytics';
import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { basketData } from './__mocks__/_mockServer';
import useUpdateBasket from './useUpdateBasket';

jest.mock('utils/analytics', () => ({
  ...jest.requireActual('utils/analytics'),
  trackCustomerAnalyticsEvent: jest.fn(),
}));

const apiPath = '*baskets/:id';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: basketData }, { status: 200 });
  })
);

describe('useUpdateBasket', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateBasket(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(basketData);
  });

  it('tracks participation only when the basket is submitted', async () => {
    const { result } = renderHook(() => useUpdateBasket(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'id', submitted: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(trackCustomerAnalyticsEvent).not.toHaveBeenCalled();

    act(() => {
      result.current.mutate({ id: 'id', submitted: true });
    });
    await waitFor(() =>
      expect(trackCustomerAnalyticsEvent).toHaveBeenCalledTimes(1)
    );
    expect(trackCustomerAnalyticsEvent).toHaveBeenCalledWith(
      'voting_submitted',
      {
        phase_id: basketData.relationships.phase.data.id,
      }
    );
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateBasket(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        id: 'id',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
