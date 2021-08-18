import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsViews from './useInsightsViews';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { insightsViewsStream } from 'modules/commercial/insights/services/insightsViews';
import views from 'modules/commercial/insights/fixtures/views';

const mockViews = {
  data: views,
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockViews);
}).pipe(delay(1));

jest.mock('modules/commercial/insights/services/insightsViews', () => {
  return {
    insightsViewsStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsViews', () => {
  it('should call insightsViewsStream with correct arguments', async () => {
    renderHook(() => useInsightsViews());
    expect(insightsViewsStream).toHaveBeenCalledWith();
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() => useInsightsViews());
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    await act(
      async () =>
        await waitFor(() => expect(result.current).toBe(mockViews.data))
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useInsightsViews());
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useInsightsViews());
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsViews());

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
