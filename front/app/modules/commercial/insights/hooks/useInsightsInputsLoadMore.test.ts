import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsInputsLoadMore, {
  QueryParameters,
} from './useInsightsInputsLoadMore';
import { Observable, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { waitFor } from 'utils/testUtils/rtl';
import {
  insightsInputsStream,
  IInsightsInputs,
} from 'modules/commercial/insights/services/insightsInputs';
import inputs from 'modules/commercial/insights/fixtures/inputs';

const viewId = '1';

const mockInputs: IInsightsInputs = {
  data: inputs,
  links: {
    self:
      'views/eefff7f5-957a-4b5b-816c-9278943ccde7/inputs?page%5Bnumber%5D=1\u0026page%5Bsize%5D=20\u0026sort=approval',
    first:
      'views/eefff7f5-957a-4b5b-816c-9278943ccde7/inputs?page%5Bnumber%5D=1\u0026page%5Bsize%5D=20\u0026sort=approval',
    last:
      'views/eefff7f5-957a-4b5b-816c-9278943ccde7/inputs?page%5Bnumber%5D=1\u0026page%5Bsize%5D=20\u0026sort=approval',
    prev: null,
    next: null,
  },
};

const queryParameters: QueryParameters = {
  category: '3',
  pageNumber: 12,
  search: 'search',
};

const expectedQueryParameters = {
  category: queryParameters.category,
  'page[number]': queryParameters.pageNumber,
  'page[size]': 20,
  search: queryParameters.search,
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockInputs);
}).pipe(delay(1));

jest.mock('modules/commercial/insights/services/insightsInputs', () => {
  return {
    insightsInputsStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsInputsLoadMore', () => {
  it('should call useInsightsInputsLoadMore with correct default arguments', async () => {
    renderHook(() => useInsightsInputsLoadMore(viewId));
    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        category: undefined,
        'page[number]': 1,
        'page[size]': 20,
        search: undefined,
      },
    });
  });
  it('should call useInsightsInputsLoadMore with correct non-default arguments', async () => {
    renderHook(() => useInsightsInputsLoadMore(viewId, queryParameters));

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: expectedQueryParameters,
    });
  });
  it('should call useInsightsInputsLoadMore with correct arguments on category change', async () => {
    let category = '5';
    const { rerender } = renderHook(() =>
      useInsightsInputsLoadMore(viewId, { ...queryParameters, category })
    );

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, category },
    });

    // Category change
    category = '6';
    rerender();

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, category },
    });
    expect(insightsInputsStream).toHaveBeenCalledTimes(2);
  });
  it('should call useInsightsInputsLoadMore with correct arguments on page number change', async () => {
    let pageNumber = 5;
    const { rerender } = renderHook(() =>
      useInsightsInputsLoadMore(viewId, { ...queryParameters, pageNumber })
    );

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        ...expectedQueryParameters,
        'page[number]': pageNumber,
      },
    });

    // Page number change
    pageNumber = 10;
    rerender();

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        ...expectedQueryParameters,
        'page[number]': pageNumber,
      },
    });
    expect(insightsInputsStream).toHaveBeenCalledTimes(2);
  });
  it('should call useInsightsInputsLoadMore with correct arguments on search change', async () => {
    let search = 'some search';
    const { rerender } = renderHook(() =>
      useInsightsInputsLoadMore(viewId, { ...queryParameters, search })
    );

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, search },
    });

    // Search change
    search = 'another search';
    rerender();

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, search },
    });
    expect(insightsInputsStream).toHaveBeenCalledTimes(2);
  });

  it('should return correct data when data', async () => {
    const { result } = renderHook(() => useInsightsInputsLoadMore(viewId));
    expect(result.current).toStrictEqual({
      hasMore: null,
      list: undefined, // initially, the hook list returns undefined
      loading: true,
    });

    await act(async () => {
      await waitFor(() => {
        expect(result.current.list).toStrictEqual(mockInputs.data);
        expect(result.current.hasMore).toStrictEqual(false);
        expect(result.current.loading).toStrictEqual(false);
      });
    });
  });

  it('should return hasMore true when last page is not null', () => {
    mockInputs.links.next = 'some value';
    mockObservable = new Observable((subscriber) => {
      subscriber.next(mockInputs);
    });
    const { result } = renderHook(() => useInsightsInputsLoadMore(viewId));
    expect(result.current.hasMore).toStrictEqual(true);
  });

  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useInsightsInputsLoadMore(viewId));
    expect(result.current.list).toStrictEqual(error);
    expect(result.current.loading).toStrictEqual(false);
    expect(result.current.hasMore).toStrictEqual(false);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useInsightsInputsLoadMore(viewId));
    expect(result.current.list).toBe(null);
    expect(result.current.loading).toStrictEqual(false);
    expect(result.current.hasMore).toStrictEqual(false);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsInputsLoadMore(viewId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
