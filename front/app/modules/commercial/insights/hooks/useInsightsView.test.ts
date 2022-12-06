import { renderHook, act } from '@testing-library/react-hooks';
import views from 'modules/commercial/insights/fixtures/views';
import { Observable, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { insightsViewStream } from 'modules/commercial/insights/services/insightsViews';
import { waitFor } from 'utils/testUtils/rtl';
import useInsightsView from './useInsightsView';

const viewId = views[0].id;

const mockView = {
  data: views[0],
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockView);
}).pipe(delay(1));

jest.mock('modules/commercial/insights/services/insightsViews', () => {
  return {
    insightsViewStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsView', () => {
  it('should call insightsViewStream with correct arguments', () => {
    renderHook(() => useInsightsView(viewId));
    expect(insightsViewStream).toHaveBeenCalledWith(viewId);
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() => useInsightsView(viewId));
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    await act(
      async () => await waitFor(() => expect(result.current).toBe(mockView))
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next(new Error());
    });
    const { result } = renderHook(() => useInsightsView(viewId));
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next(null);
    });
    const { result } = renderHook(() => useInsightsView(viewId));
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    jest.spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsView(viewId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
