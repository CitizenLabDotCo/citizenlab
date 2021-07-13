import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsView from './useInsightsView';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { insightsViewStream } from 'modules/commercial/insights/services/insightsViews';

const viewId = '1aa8a788-3aee-4ada-a581-6d934e49784b';

const mockView = {
  data: {
    id: viewId,
    type: 'view',
    attributes: {
      name: 'Test',
      updated_at: '2021-05-18T16:07:27.123Z',
    },
  },
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
      async () =>
        await waitFor(() => expect(result.current).toBe(mockView.data))
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useInsightsView(viewId));
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useInsightsView(viewId));
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsView(viewId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
