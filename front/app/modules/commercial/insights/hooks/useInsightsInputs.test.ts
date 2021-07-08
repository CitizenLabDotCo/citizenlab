import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsInputs, { QueryParameters } from './useInsightsInputs';
import { Observable, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { waitFor } from 'utils/testUtils/rtl';
import { insightsInputsStream } from 'modules/commercial/insights/services/insightsInputs';

const viewId = '1';

const queryParameters: QueryParameters = {
  category: '3',
  pageSize: 10,
  pageNumber: 12,
  search: 'search',
  sort: '-approval',
};

const mockInputs = {
  data: {
    currentPage: 1,
    lastPage: 2,
    list: [
      {
        id: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
        type: 'input',
        relationships: {
          source: {
            data: {
              id: '4e9ac1f1-6928-45e9-9ac9-313e86ad636f',
              type: 'idea',
            },
          },
          categories: {
            data: [
              {
                id: '94a649b5-23fe-4d47-9165-9beceef2dcad',
                type: 'category',
              },
              {
                id: '94a649b5-23fe-4d47-9165-9becedfg45sd',
                type: 'category',
              },
            ],
          },
          suggested_categories: {
            data: [],
          },
        },
      },
      {
        id: '54438f73-12f4-4b16-84f3-a55bd118de7e',
        type: 'input',
        relationships: {
          source: {
            data: {
              id: '54438f73-12f4-4b16-84f3-a55bd118de7e',
              type: 'idea',
            },
          },
          categories: {
            data: [],
          },
          suggested_categories: {
            data: [],
          },
        },
      },
    ],
  },
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
      queryParameters: {
        category: queryParameters.category,
        'page[number]': queryParameters.pageNumber,
        'page[size]': queryParameters.pageSize,
        search: queryParameters.search,
        sort: queryParameters.sort,
      },
    });
  });
  it('should return correct data when data', () => {
    const { result } = renderHook(() => useInsightsInputs(viewId));
    expect(result.current).toStrictEqual({
      lastPage: null,
      list: undefined, // initially, the hook list returns undefined
      loading: true,
    });
    act(() => {
      waitFor(() => {
        expect(result.current.list).toBe(mockInputs.data.list);
        expect(result.current.lastPage).toBe(mockInputs.data.lastPage);
        expect(result.current.loading).toBe(false);
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
