import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsCategory from './useInsightsCategory';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { insightsCategoryStream } from 'modules/commercial/insights/services/insightsCategories';
import categories from 'modules/commercial/insights/fixtures/categories';

const viewId = '1';
const categoryId = categories[0].id;

const mockCategory = {
  data: categories[0],
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockCategory);
}).pipe(delay(1));

jest.mock('modules/commercial/insights/services/insightsCategories', () => {
  return {
    insightsCategoryStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsCategory', () => {
  it('should call insightsCategoryStream with correct arguments', () => {
    renderHook(() => useInsightsCategory(viewId, categoryId));
    expect(insightsCategoryStream).toHaveBeenCalledWith(viewId, categoryId);
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() =>
      useInsightsCategory(viewId, categoryId)
    );
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    await act(
      async () =>
        await waitFor(() => expect(result.current).toBe(mockCategory.data))
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() =>
      useInsightsCategory(viewId, categoryId)
    );
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() =>
      useInsightsCategory(viewId, categoryId)
    );
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() =>
      useInsightsCategory(viewId, categoryId)
    );

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
