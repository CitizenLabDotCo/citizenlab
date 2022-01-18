import { renderHook, act } from '@testing-library/react-hooks';
import useScanInsightsCategory from './useScanInsightsCategory';
import { Observable } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';

import { insightsCategoriesSuggestionsTasksStream } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

const viewId = '1';
let categoryId = '3';

const categoriesSuggestionsTasks = {
  count: 3,
};

let mockCategoriesSuggestionsTasks = categoriesSuggestionsTasks;

jest.mock('utils/streams', () => {
  return { fetchAllWith: jest.fn() };
});

jest.mock('utils/analytics');

const mockObservable = new Observable((subscriber) => {
  subscriber.next(mockCategoriesSuggestionsTasks);
});

jest.mock(
  'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks',
  () => {
    return {
      insightsTriggerCategoriesSuggestionsTasks: jest.fn(),
      insightsDeleteCategoriesSuggestionsTasks: jest.fn(),
      insightsCategoriesSuggestionsTasksStream: jest.fn(() => {
        return {
          observable: mockObservable,
        };
      }),
    };
  }
);

describe('useScanInsightsCategory', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should return correct status when there are no more tasks', async () => {
    mockCategoriesSuggestionsTasks = categoriesSuggestionsTasks;
    const { result } = renderHook(() =>
      useScanInsightsCategory(viewId, categoryId)
    );
    mockCategoriesSuggestionsTasks = { count: 0 };

    act(() => {
      jest.advanceTimersByTime(8000);
    });

    await waitFor(() => {
      expect(result.current.status).toEqual('isFinished');
    });

    act(() => {
      result.current.onDone();
      jest.advanceTimersByTime(4000);
    });

    await waitFor(() => {
      expect(result.current.status).toEqual('isIdle');
    });
  });

  it('should return correct status and progress when no tasks', async () => {
    const { result } = renderHook(() =>
      useScanInsightsCategory(viewId, categoryId)
    );

    await waitFor(() => {
      expect(result.current.status).toEqual('isIdle');
    });
  });

  it('should return correct status when scan is cancelled', async () => {
    const { result } = renderHook(() =>
      useScanInsightsCategory(viewId, categoryId)
    );

    act(() => {
      result.current.cancelScan();
    });

    expect(result.current.status).toEqual('isCancelling');

    await waitFor(() => {
      expect(result.current.status).toEqual('isIdle');
    });
  });

  it('should return correct status when there are tasks', async () => {
    mockCategoriesSuggestionsTasks = categoriesSuggestionsTasks;
    const { result } = renderHook(() =>
      useScanInsightsCategory(viewId, categoryId)
    );
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(result.current.status).toEqual('isScanning');
  });

  it('should return correct status when scan is triggered', async () => {
    const { result } = renderHook(() =>
      useScanInsightsCategory(viewId, categoryId)
    );

    act(() => {
      result.current.triggerScan();
    });

    await waitFor(() => {
      expect(result.current.status).toEqual('isInitializingScanning');
    });
  });

  it('should call insightsCategoriesSuggestionsTasksStream with correct viewId and categoryId', async () => {
    mockCategoriesSuggestionsTasks = { count: 0 };
    categoryId = '';
    renderHook(() => useScanInsightsCategory(viewId, categoryId, true));

    expect(insightsCategoriesSuggestionsTasksStream).toHaveBeenCalledWith(
      viewId,
      {
        queryParameters: {
          inputs: { processed: true, categories: [categoryId] },
        },
      }
    );
  });

  it('should call insightsCategoriesSuggestionsTasksStream with correct arguments on categories change', async () => {
    categoryId = '5';
    const { rerender } = renderHook(() =>
      useScanInsightsCategory(viewId, categoryId)
    );

    expect(insightsCategoriesSuggestionsTasksStream).toHaveBeenCalledWith(
      viewId,
      {
        queryParameters: {
          categories: [categoryId],
        },
      }
    );

    // Categories change
    categoryId = '10';
    rerender();
    expect(insightsCategoriesSuggestionsTasksStream).toHaveBeenCalledWith(
      viewId,
      {
        queryParameters: {
          categories: [categoryId],
        },
      }
    );
    expect(insightsCategoriesSuggestionsTasksStream).toHaveBeenCalledTimes(2);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});
