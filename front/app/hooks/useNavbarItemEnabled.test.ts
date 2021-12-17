import { renderHook } from '@testing-library/react-hooks';
import useNavbarItemEnabled from './useNavbarItemEnabled';
import { Observable, Subscription } from 'rxjs';
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

describe('useNavbarItemEnabled', () => {
  it('should call navbarItemsStream', () => {
    renderHook(() => useNavbarItemEnabled('events'));
    expect(navbarItemsStream).toHaveBeenCalledTimes(1);
  });

  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next(new Error());
    });

    const { result } = renderHook(() => useNavbarItemEnabled('events'));
    expect(result.current).toStrictEqual(error);
  });

  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next(null);
    });

    const { result } = renderHook(() => useNavbarItemEnabled('events'));
    expect(result.current).toBe(null);
  });

  it('should unsubscribe on unmount', () => {
    jest.spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useNavbarItemEnabled('events'));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should return true if item is in navbar', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: navbarItems });
    });

    const { result } = renderHook(() => useNavbarItemEnabled('events'));
    expect(result.current).toBe(true);
  });

  it('should return false if item is not in navbar', () => {
    const data = navbarItems.filter(
      (navbarItem) => navbarItem.attributes.code !== 'events'
    );
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data });
    });

    const { result } = renderHook(() => useNavbarItemEnabled('events'));
    expect(result.current).toBe(false);
  });
});
