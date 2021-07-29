import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsInputs, { QueryParameters } from './useInsightsInputs';
import { Observable, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { waitFor } from 'utils/testUtils/rtl';
import { insightsInputsStream } from 'modules/commercial/insights/services/insightsInputs';

const viewId = '1';

const mockInputs = {
  data: [
    {
      id: 'f270e1dd-48c2-4736-912a-1aba276dcd1a',
      type: 'input',
      relationships: {
        source: {
          data: { id: 'f270e1dd-48c2-4736-912a-1aba276dcd1a', type: 'idea' },
        },
        categories: { data: [] },
        suggested_categories: { data: [] },
      },
    },
    {
      id: '49d36411-d736-4fc9-9e66-fa05d57663b7',
      type: 'input',
      relationships: {
        source: {
          data: { id: '49d36411-d736-4fc9-9e66-fa05d57663b7', type: 'idea' },
        },
        categories: {
          data: [
            { id: '4e14b5b3-d95a-4925-8eba-1f57b7e87f63', type: 'category' },
            { id: '3d0e81fb-062f-4ce2-981e-0f619cea4c4f', type: 'category' },
          ],
        },
        suggested_categories: { data: [] },
      },
    },
  ],
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
  pageSize: 10,
  pageNumber: 12,
  search: 'search',
  sort: '-approval',
  processed: true,
};

const expectedQueryParameters = {
  category: queryParameters.category,
  'page[number]': queryParameters.pageNumber,
  'page[size]': queryParameters.pageSize,
  search: queryParameters.search,
  sort: queryParameters.sort,
  processed: true,
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

describe('useInsightsInputs', () => {
  it('should call useInsightsInputs with correct default arguments', async () => {
    renderHook(() => useInsightsInputs(viewId));
    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        category: undefined,
        'page[number]': 1,
        'page[size]': 20,
        search: undefined,
        sort: 'approval',
      },
    });
  });
  it('should call useInsightsInputs with correct non-default arguments', async () => {
    renderHook(() => useInsightsInputs(viewId, queryParameters));

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: expectedQueryParameters,
    });
  });
  it('should call useInsightsInputs with correct arguments on category change', async () => {
    let category = '5';
    const { rerender } = renderHook(() =>
      useInsightsInputs(viewId, { ...queryParameters, category })
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
  it('should call useInsightsInputs with correct arguments on page number change', async () => {
    let pageNumber = 5;
    const { rerender } = renderHook(() =>
      useInsightsInputs(viewId, { ...queryParameters, pageNumber })
    );

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        ...expectedQueryParameters,
        'page[number]': pageNumber,
      },
    });

    // Search change
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
  it('should call useInsightsInputs with correct arguments on page size change', async () => {
    let pageSize = 5;
    const { rerender } = renderHook(() =>
      useInsightsInputs(viewId, { ...queryParameters, pageSize })
    );

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, 'page[size]': pageSize },
    });

    // Search change
    pageSize = 10;
    rerender();

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, 'page[size]': pageSize },
    });
    expect(insightsInputsStream).toHaveBeenCalledTimes(2);
  });
  it('should call useInsightsInputs with correct arguments on search change', async () => {
    let search = 'some search';
    const { rerender } = renderHook(() =>
      useInsightsInputs(viewId, { ...queryParameters, search })
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
  it('should call useInsightsInputs with correct arguments on sort change', async () => {
    let sort: QueryParameters['sort'] = 'approval';
    const { rerender } = renderHook(() =>
      useInsightsInputs(viewId, { ...queryParameters, sort })
    );

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, sort },
    });

    // Sort change
    sort = '-approval';
    rerender();

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, sort },
    });
    expect(insightsInputsStream).toHaveBeenCalledTimes(2);
  });
  it('should call useInsightsInputs with correct arguments on processed change', async () => {
    let processed = true;
    const { rerender } = renderHook(() =>
      useInsightsInputs(viewId, { ...queryParameters, processed })
    );

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, processed },
    });

    // Processed change
    processed = false;
    rerender();

    expect(insightsInputsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { ...expectedQueryParameters, processed },
    });
    expect(insightsInputsStream).toHaveBeenCalledTimes(2);
  });
  it('should return correct data when data', async () => {
    const { result } = renderHook(() => useInsightsInputs(viewId));
    expect(result.current).toStrictEqual({
      lastPage: null,
      list: undefined, // initially, the hook list returns undefined
      loading: true,
    });

    await act(async () => {
      await waitFor(() => {
        expect(result.current.list).toStrictEqual(mockInputs.data);
        expect(result.current.lastPage).toStrictEqual(1);
        expect(result.current.loading).toStrictEqual(false);
      });
    });
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useInsightsInputs(viewId));
    expect(result.current.list).toStrictEqual(error);
    expect(result.current.loading).toStrictEqual(false);
    expect(result.current.lastPage).toStrictEqual(null);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useInsightsInputs(viewId));
    expect(result.current.list).toBe(null);
    expect(result.current.loading).toStrictEqual(false);
    expect(result.current.lastPage).toStrictEqual(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsInputs(viewId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
