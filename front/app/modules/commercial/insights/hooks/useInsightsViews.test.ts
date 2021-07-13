import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsViews from './useInsightsViews';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { insightsViewsStream } from 'modules/commercial/insights/services/insightsViews';

const mockViews = {
  data: [
    {
      id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
      type: 'view',
      attributes: {
        name: 'Test',
        updated_at: '2021-05-18T16:07:27.123Z',
      },
    },
    {
      id: '4b429681-1744-456f-8550-e89a2c2c74b2',
      type: 'view',
      attributes: {
        name: 'Test 2',
        updated_at: '2021-05-18T16:07:49.156Z',
      },
    },
  ],
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
