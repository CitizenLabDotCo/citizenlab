import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsDetectedCategories from './useInsightsDetectedCategories';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { insightsDetectedCategoriesStream } from 'modules/commercial/insights/services/insightsDetectCategories';

const viewId = '1';
const mockDetectedCategories = {
  data: {
    names: ['housing', 'rental', 'city', 'home', 'rent', 'tax'],
  },
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockDetectedCategories);
}).pipe(delay(1));

jest.mock(
  'modules/commercial/insights/services/insightsDetectCategories',
  () => {
    return {
      insightsDetectedCategoriesStream: jest.fn(() => {
        return {
          observable: mockObservable,
        };
      }),
    };
  }
);

describe('useInsightsDetectedCategories', () => {
  it('should call insightsDetectedCategoriesStream with correct arguments', async () => {
    renderHook(() => useInsightsDetectedCategories(viewId));
    expect(insightsDetectedCategoriesStream).toHaveBeenCalledWith('1');
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() => useInsightsDetectedCategories(viewId));
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    await act(
      async () =>
        await waitFor(() =>
          expect(result.current).toBe(mockDetectedCategories.data)
        )
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next(error);
    });
    const { result } = renderHook(() => useInsightsDetectedCategories(viewId));
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next(null);
    });
    const { result } = renderHook(() => useInsightsDetectedCategories(viewId));
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    jest.spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsDetectedCategories(viewId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
