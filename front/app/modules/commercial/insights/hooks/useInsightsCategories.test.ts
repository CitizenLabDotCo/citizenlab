import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsCategories from './useInsightsCategories';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { insightsCategoriesStream } from 'modules/commercial/insights/services/insightsCategories';
import categories from 'modules/commercial/insights/fixtures/categories';

const viewId = '1';

const mockCategories = {
  data: categories,
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockCategories);
}).pipe(delay(1));

jest.mock('modules/commercial/insights/services/insightsCategories', () => {
  return {
    insightsCategoriesStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsCategories', () => {
  it('should call insightsCategoriesStream with correct arguments', () => {
    renderHook(() => useInsightsCategories(viewId));
    expect(insightsCategoriesStream).toHaveBeenCalledWith(viewId);
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() => useInsightsCategories(viewId));
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    await act(
      async () =>
        await waitFor(() => expect(result.current).toBe(mockCategories.data))
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useInsightsCategories(viewId));
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useInsightsCategories(viewId));
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsCategories(viewId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
