import { renderHook, act } from '@testing-library/react-hooks';
import usePages from './usePages';
import { Observable } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { allPages, somePages } from './fixtures/pages';
import { listPages, pageByIdStream } from 'services/pages';

const getMockObservable = (mockInput) => {
  return new Observable((subscriber) => {
    subscriber.next(mockInput);
  }).pipe(delay(1));
};

const mockInput1 = { data: allPages };
const mockInput2 = { data: somePages };
let mockObservable1 = getMockObservable(mockInput1);

const ids = [
  '30ce9b3e-549e-484d-9493-1fd40a11ec57',
  '4b07a373-d109-422f-975e-8c1ecd9c6d65',
];

jest.mock('services/pages', () => {
  return {
    listPages: jest.fn(() => {
      return {
        observable: mockObservable1,
      };
    }),

    pageByIdStream: jest.fn((id) => {
      const page = mockInput2.data.find((page) => id === page.id);

      return {
        observable: getMockObservable({ data: page }),
      };
    }),
  };
});

describe('usePages', () => {
  it('should call listPages if no ids are provided', () => {
    renderHook(() => usePages());
    expect(listPages).toHaveBeenCalledWith();
  });

  it('should call pageByIdStream if ids are provided', () => {
    renderHook(() => usePages({ ids }));
    expect(pageByIdStream).toHaveBeenCalledTimes(2);
    expect(pageByIdStream).toHaveBeenLastCalledWith(
      '4b07a373-d109-422f-975e-8c1ecd9c6d65'
    );
  });

  it('should return data when data (no ids)', async () => {
    const { result } = renderHook(() => usePages());

    await act(
      async () =>
        await waitFor(() => expect(result.current).toBe(mockInput1.data))
    );
  });

  it('should return data when data (ids)', async () => {
    const { result } = renderHook(() => usePages({ ids }));

    await act(
      async () =>
        await waitFor(() => expect(result.current).toEqual(mockInput2.data))
    );
  });

  it('should return error when error', () => {
    const error = new Error();
    mockObservable1 = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });

    const { result } = renderHook(() => usePages());
    expect(result.current).toStrictEqual(error);
  });

  it('should return null when data is null', () => {
    mockObservable1 = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });

    const { result } = renderHook(() => usePages());
    expect(result.current).toBe(null);
  });

  // it('should unsubscribe on unmount', () => {
  //   jest.spyOn(Subscription.prototype, 'unsubscribe');
  //   const { unmount } = renderHook(() => usePages());

  //   unmount();
  //   expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  // });
});
