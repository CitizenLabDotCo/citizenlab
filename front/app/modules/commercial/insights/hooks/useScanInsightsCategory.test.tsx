import { renderHook, act } from '@testing-library/react-hooks';
import useScanInsightsCategory from './useScanInsightsCategory';
import { Observable } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';

import { insightsCategoriesSuggestionsTasksStream } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

const viewId = '1';
let categoryId = '3';

const categoriesSuggestionsTasks = {
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
    mockCategoriesSuggestionsTasks = { data: [] };

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
    mockCategoriesSuggestionsTasks = { data: [] };
    renderHook(() => useScanInsightsCategory(viewId, categoryId));

    expect(insightsCategoriesSuggestionsTasksStream).toHaveBeenCalledWith(
      viewId,
      {
        queryParameters: { categories: [categoryId] },
      }
    );
  });

  it('should call insightsCategoriesSuggestionsTasksStream with correct arguments on categories change', async () => {
    const { rerender } = renderHook(() =>
      useScanInsightsCategory(viewId, categoryId)
    );

    expect(insightsCategoriesSuggestionsTasksStream).toHaveBeenCalledWith(
      viewId,
      {
        queryParameters: { categories: [categoryId] },
      }
    );

    // Categories change
    categoryId = '10';
    rerender();

    expect(insightsCategoriesSuggestionsTasksStream).toHaveBeenCalledWith(
      viewId,
      {
        queryParameters: { categories: [categoryId] },
      }
    );
    expect(insightsCategoriesSuggestionsTasksStream).toHaveBeenCalledTimes(2);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});
