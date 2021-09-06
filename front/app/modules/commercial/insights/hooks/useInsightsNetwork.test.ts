import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsNetwork from './useInsightsNetwork';
import { Observable, Subscription } from 'rxjs';
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

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockNetwork);
}).pipe(delay(1));

jest.mock('modules/commercial/insights/services/insightsNetwork', () => {
  return {
    insightsNetworkStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsNetwork', () => {
  it('should call insightsNetworkStream with correct arguments', async () => {
    renderHook(() => useInsightsNetwork(viewId));
    expect(insightsNetworkStream).toHaveBeenCalledWith(viewId);
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() => useInsightsNetwork(viewId));
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    await act(
      async () =>
        await waitFor(() => expect(result.current).toBe(mockNetwork.data))
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useInsightsNetwork(viewId));
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useInsightsNetwork(viewId));
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsNetwork(viewId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
