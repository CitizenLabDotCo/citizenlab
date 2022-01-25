import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsNetwork, { queryParameters } from './useInsightsNetwork';
import { Observable } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { insightsNetworkStream } from 'modules/commercial/insights/services/insightsNetwork';

const viewId = '1';

const mockNetwork = {
  data: {
    id: '2',
    type: 'network',
    attributes: {
      nodes: [
        {
          id: '0',
          clusted_id: null, // This means it's a cluster node
          name: 'komen, fietser, rijden',
          val: 450,
          color: '#0000FF',
        },
        {
          cluster_id: '0',
          id: 'komen',
          name: 'komen',
          val: 3,
          color: '#0000FF',
        },
        {
          cluster_id: '0',
          id: 'fietser',
          name: 'fietser',
          val: '4',
          color: '#0000FF',
        },
        {
          id: '1',
          clusted_id: null,
          name: 'kind, school, student',
          val: 300,
          color: '#00FF00',
        },
        {
          cluster_id: '1',
          id: 'kind',
          name: 'kind',
          val: 1.5,
          color: '#00FF00',
        },
        {
          cluster_id: '1',
          id: 'school',
          name: 'school',
          val: 1,
          color: '#00FF00',
        },
        {
          cluster_id: '1',
          id: 'student',
          name: 'student',
          val: 2,
          color: '#00FF00',
        },
      ],
      links: [
        { source: '0', target: '1' }, // Link between the two clusters
        { source: '0', target: 'komen' },
        { source: '0', target: 'fietser' },
        { source: '1', target: 'kind' },
        { source: '1', target: 'school' },
        { source: '1', target: 'student' },
      ],
    },
  },
};

const mockNetworkAnalysisTasks = {
  data: [
    {
      id: '58ed4a03-155b-4b60-ac9e-cf101e6d94d0',
      type: 'network_text_analysis_task',
      attributes: {
        created_at: '2021-07-08T12:01:53.254Z',
      },
    },
    {
      id: '140b1468-8b49-4999-a51c-084d8e17eefa',
      type: 'network_text_analysis_task',
      attributes: {
        created_at: '2021-07-08T12:01:53.330Z',
      },
    },
  ],
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockNetwork);
}).pipe(delay(1));

let mockTasksObservable = new Observable((subscriber) => {
  subscriber.next(mockNetworkAnalysisTasks);
});

jest.mock('modules/commercial/insights/services/insightsNetwork', () => {
  return {
    insightsNetworkStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

jest.mock(
  'modules/commercial/insights/services/insightsTextNetworkAnalysisTasks',
  () => {
    return {
      insightsTextNetworkAnalysisTasksStream: jest.fn(() => {
        return {
          observable: mockTasksObservable,
        };
      }),
    };
  }
);

jest.mock('utils/streams', () => {
  return { fetchAllWith: jest.fn() };
});

describe('useInsightsNetwork', () => {
  it('should call insightsNetworkStream with correct arguments', async () => {
    renderHook(() => useInsightsNetwork(viewId));
    expect(insightsNetworkStream).toHaveBeenCalledWith(viewId, {
      queryParameters,
    });
  });

  it('should return loading=true when there are tasks', () => {
    const { result } = renderHook(() => useInsightsNetwork(viewId));
    expect(result.current.loading).toBe(true);
  });
  it('should return loading=false when there are no tasks', () => {
    mockTasksObservable = new Observable((subscriber) =>
      subscriber.next({ data: [] })
    );
    const { result } = renderHook(() => useInsightsNetwork(viewId));
    expect(result.current.loading).toBe(false);
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() => useInsightsNetwork(viewId));
    expect(result.current.network).toBe(undefined); // initially, the hook returns undefined
    await act(
      async () =>
        await waitFor(() =>
          expect(result.current.network).toStrictEqual(mockNetwork)
        )
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next(error);
    });
    const { result } = renderHook(() => useInsightsNetwork(viewId));
    expect(result.current.network).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next(null);
    });
    const { result } = renderHook(() => useInsightsNetwork(viewId));
    expect(result.current.network).toBe(null);
  });
});
