import { renderHook, act } from '@testing-library/react-hooks';
import useNavbarItems from './useNavbarItems';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import navbarItems from './fixtures/navbarItems';
import { navbarItemsStream } from 'services/navbar';

const mockInput = {
  data: navbarItems,
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockInput);
}).pipe(delay(1));

jest.mock('services/navbar', () => {
  return {
    navbarItemsStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useNavbarItems', () => {
  it('should call navbarItemsStream', () => {
    renderHook(() => useNavbarItems());
    expect(navbarItemsStream).toHaveBeenCalledTimes(1);
  });

  it('should return data when data', async () => {
    const { result } = renderHook(() => useNavbarItems());

    await act(
      async () =>
        await waitFor(() => expect(result.current).toEqual(mockInput.data))
    );
  });

  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next(new Error());
    });

    const { result } = renderHook(() => useNavbarItems());
    expect(result.current).toStrictEqual(error);
  });

  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next(null);
    });

    const { result } = renderHook(() => useNavbarItems());
    expect(result.current).toBe(null);
  });

  it('should unsubscribe on unmount', () => {
    jest.spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useNavbarItems());

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
