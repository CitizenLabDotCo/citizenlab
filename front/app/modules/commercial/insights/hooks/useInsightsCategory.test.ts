import { renderHook } from '@testing-library/react-hooks';
import useInsightsCategory from './useInsightsCategory';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { insightsCategoryStream } from 'modules/commercial/insights/services/insightsCategories';

const viewId = '1';
const categoryId = '1aa8a788-3aee-4ada-a581-6d934e49784b';

const mockCategory = {
  data: {
    id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
    type: 'category',
    attributes: {
      name: 'Test',
    },
  },
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(setTimeout(() => mockCategory, 0));
});

jest.mock('modules/commercial/insights/services/insightsCategories', () => {
  return {
    insightsCategoryStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsCategories', () => {
  it('should call insightsCategoryStream with correct arguments', async () => {
    renderHook(() => useInsightsCategory(viewId, categoryId));
    expect(insightsCategoryStream).toHaveBeenCalledWith(viewId, categoryId);
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() =>
      useInsightsCategory(viewId, categoryId)
    );
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    waitFor(() => expect(result.current).toBe(mockCategory.data));
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
