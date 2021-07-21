import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsInputsCount, {
  QueryParameters,
} from './useInsightsInputsCount';
import { Observable, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { waitFor } from 'utils/testUtils/rtl';
import { insightsInputsCountStream } from 'modules/commercial/insights/services/insightsInputsCount';

const viewId = '1';

const mockInputsCount = { count: 3 };

const queryParameters: QueryParameters = {
  category: '3',
  search: 'search',
};

const expectedQueryParameters = {
  category: queryParameters.category,
  search: queryParameters.search,
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockInputsCount);
}).pipe(delay(1));

jest.mock('modules/commercial/insights/services/insightsInputsCount', () => {
  return {
    insightsInputsCountStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsInputsCount', () => {
  it('should call useInsightsInputsCount with correct default arguments', async () => {
    renderHook(() => useInsightsInputsCount(viewId));
    expect(insightsInputsCountStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        category: undefined,
        search: undefined,
      },
    });
  });
  it('should call useInsightsInputsCount with correct non-default arguments', async () => {
    renderHook(() => useInsightsInputsCount(viewId, queryParameters));

    expect(insightsInputsCountStream).toHaveBeenCalledWith(viewId, {
      queryParameters: expectedQueryParameters,
    });
  });
  it('should call useInsightsInputsCount with correct arguments on category change', async () => {
    let category = '5';
    const { rerender } = renderHook(() =>
      useInsightsInputsCount(viewId, { ...queryParameters, category })
    );

    expect(insightsInputsCountStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, category },
    });

    // Category change
    category = '6';
    rerender();

    expect(insightsInputsCountStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, category },
    });
    expect(insightsInputsCountStream).toHaveBeenCalledTimes(2);
  });

  it('should call useInsightsInputsCount with correct arguments on search change', async () => {
    let search = 'some search';
    const { rerender } = renderHook(() =>
      useInsightsInputsCount(viewId, { ...queryParameters, search })
    );

    expect(insightsInputsCountStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, search },
    });

    // Search change
    search = 'another search';
    rerender();

    expect(insightsInputsCountStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, search },
    });
    expect(insightsInputsCountStream).toHaveBeenCalledTimes(2);
  });

  it('should return correct data when data', async () => {
    const { result } = renderHook(() => useInsightsInputsCount(viewId));
    expect(result.current).toStrictEqual(undefined);

    await act(async () => {
      await waitFor(() => {
        expect(result.current).toStrictEqual(mockInputsCount);
      });
    });
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next(error);
    });
    const { result } = renderHook(() => useInsightsInputsCount(viewId));
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next(null);
    });
    const { result } = renderHook(() => useInsightsInputsCount(viewId));
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsInputsCount(viewId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
