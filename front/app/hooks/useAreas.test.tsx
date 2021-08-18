import { renderHook, act } from '@testing-library/react-hooks';
import useAreas from './useAreas';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { areasStream } from 'services/areas';
import areas from './fixtures/areas';

const mockAreas = {
  data: areas,
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockAreas);
}).pipe(delay(1));

jest.mock('services/areas', () => {
  return {
    areasStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useAreas', () => {
  it('should call areasStream with correct arguments', async () => {
    renderHook(() => useAreas());
    expect(areasStream).toHaveBeenCalledWith();
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() => useAreas());
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    await act(
      async () =>
        await waitFor(() => expect(result.current).toBe(mockAreas.data))
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useAreas());
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useAreas());
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useAreas());

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
