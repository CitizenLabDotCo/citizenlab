import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsCategorySuggestions, {
  QueryParameters,
} from './useInsightsCategorySuggestions';
import { Observable, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { waitFor } from 'utils/testUtils/rtl';
import { insightsCategorySuggestionsStream } from 'modules/commercial/insights/services/insightsCategorySuggestions';
import streams from 'utils/streams';

const viewId = '1';

const queryParameters: QueryParameters = {
  categories: ['3'],
  inputs: ['10'],
};

const mockCategorySuggestions = {
  data: [
    {
      id: '58ed4a03-155b-4b60-ac9e-cf101e6d94d0',
      type: 'zeroshot_classification_task',
      attributes: {
        created_at: '2021-07-08T12:01:53.254Z',
      },
      relationships: {
        categories: {
          data: [
            {
              id: 'e499e92b-3d9a-4147-99ed-4abdc4fe558f',
              type: 'category',
            },
          ],
        },
        inputs: {
          data: [
            {
              id: '20c7e056-7c7c-477f-bf0e-72a7ce6fb515',
              type: 'input',
            },
          ],
        },
      },
    },
    {
      id: '140b1468-8b49-4999-a51c-084d8e17eefa',
      type: 'zeroshot_classification_task',
      attributes: {
        created_at: '2021-07-08T12:01:53.330Z',
      },
      relationships: {
        categories: {
          data: [
            {
              id: 'e499e92b-3d9a-4147-99ed-4abdc4fe558f',
              type: 'category',
            },
          ],
        },
        inputs: {
          data: [
            {
              id: 'e8b3aa62-4ea2-474b-a97b-872e7ca47b73',
              type: 'input',
            },
          ],
        },
      },
    },
  ],
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockCategorySuggestions);
}).pipe(delay(1));

jest.mock(
  'modules/commercial/insights/services/insightsCategorySuggestions',
  () => {
    return {
      insightsCategorySuggestionsStream: jest.fn(() => {
        return {
          observable: mockObservable,
        };
      }),
    };
  }
);

jest.mock('utils/streams', () => {
  return { fetchAllWith: jest.fn() };
});

jest.mock('utils/helperUtils', () => {
  return { isNilOrError: jest.fn(() => false) };
});

describe('useInsightsCategorySuggestions', () => {
  it('should call useInsightsCategorySuggestions with correct viewId', async () => {
    renderHook(() => useInsightsCategorySuggestions(viewId));
    expect(insightsCategorySuggestionsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: { categories: undefined, inputs: undefined },
    });
  });

  it('should call useInsightsCategorySuggestions with correct query parameters', async () => {
    renderHook(() => useInsightsCategorySuggestions(viewId, queryParameters));
    expect(insightsCategorySuggestionsStream).toHaveBeenCalledWith(viewId, {
      queryParameters,
    });
  });

  it('should call insightsCategorySuggestionsStream with correct arguments on categories change', async () => {
    let categories = ['5'];
    const { rerender } = renderHook(() =>
      useInsightsCategorySuggestions(viewId, { ...queryParameters, categories })
    );

    expect(insightsCategorySuggestionsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        ...queryParameters,
        categories,
      },
    });

    // Categories change
    categories = ['10'];
    rerender();

    expect(insightsCategorySuggestionsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        ...queryParameters,
        categories,
      },
    });
    expect(insightsCategorySuggestionsStream).toHaveBeenCalledTimes(2);
  });

  it('should call insightsCategorySuggestionsStream with correct arguments on inputs change', async () => {
    let inputs = ['5'];
    const { rerender } = renderHook(() =>
      useInsightsCategorySuggestions(viewId, { ...queryParameters, inputs })
    );

    expect(insightsCategorySuggestionsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        ...queryParameters,
        inputs,
      },
    });

    // Inputs change
    inputs = ['10'];
    rerender();

    expect(insightsCategorySuggestionsStream).toHaveBeenCalledWith(viewId, {
      queryParameters: {
        ...queryParameters,
        inputs,
      },
    });
    expect(insightsCategorySuggestionsStream).toHaveBeenCalledTimes(2);
  });

  it('should return correct data when data', async () => {
    const { result } = renderHook(() => useInsightsCategorySuggestions(viewId));
    expect(result.current).toStrictEqual(undefined); // initially, the hook returns undefined

    await act(
      async () =>
        await waitFor(() => {
          expect(result.current).toStrictEqual(mockCategorySuggestions.data);
        })
    );
  });

  it('should call streams.fetchAllWith with correct arguments when data', async () => {
    jest.useFakeTimers();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: mockCategorySuggestions.data });
    });
    const { result } = renderHook(() => useInsightsCategorySuggestions(viewId));
    expect(result.current).toStrictEqual(mockCategorySuggestions.data);
    await waitFor(() => {
      expect(streams.fetchAllWith).toHaveBeenCalledWith({
        partialApiEndpoint: [
          'insights/views/1/tasks/category_suggestions',
          'insights/views/1/inputs',
        ],
      });
    });
  });

  it('should not call streams.fetchAllWith when data is empty', async () => {
    jest.useFakeTimers();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: [] });
    });
    const { result } = renderHook(() => useInsightsCategorySuggestions(viewId));
    expect(result.current).toStrictEqual([]);
    await waitFor(() => {
      expect(streams.fetchAllWith).not.toHaveBeenCalled();
    });
  });

  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useInsightsCategorySuggestions(viewId));
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useInsightsCategorySuggestions(viewId));
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() =>
      useInsightsCategorySuggestions(viewId)
    );

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(2);
  });
  afterEach(() => {
    jest.useRealTimers();
  });
});
