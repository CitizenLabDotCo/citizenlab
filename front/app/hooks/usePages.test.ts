import { renderHook, act } from '@testing-library/react-hooks';
import usePages from './usePages';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import pages from './fixtures/staticPages';
import { listPages, customPageByIdStream } from 'services/staticPages';

const mockInputListPages = {
  data: pages,
};

let mockObservableListPages = new Observable((subscriber) => {
  subscriber.next(mockInputListPages);
}).pipe(delay(1));

const faqId = '793d56cc-c8b3-4422-b393-972b71f82aa2';
const aboutId = 'e7854e94-3074-4607-b66e-0422aa3d8359';
const faqPage = pages[2];
const aboutPage = pages[4];

let mockObservablecustomPageByIdStream = (id) =>
  new Observable((subscriber) => {
    id === faqId
      ? subscriber.next({ data: faqPage })
      : subscriber.next({ data: aboutPage });
  }).pipe(delay(1));

jest.mock('services/pages', () => {
  return {
    listPages: jest.fn(() => ({
      observable: mockObservableListPages,
    })),

    customPageByIdStream: jest.fn((id) => ({
      observable: mockObservablecustomPageByIdStream(id),
    })),
  };
});

jest.mock('services/locale');

describe('usePages', () => {
  describe('no ids', () => {
    it('should call listPages', () => {
      renderHook(() => usePages());
      expect(listPages).toHaveBeenCalledTimes(1);
    });

    it('should return data when data', async () => {
      const { result } = renderHook(() => usePages());

      await act(
        async () => await waitFor(() => expect(result.current).toBe(pages))
      );
    });

    it('should return error when error', () => {
      const error = new Error();
      mockObservableListPages = new Observable((subscriber) => {
        subscriber.next(new Error());
      });

      const { result } = renderHook(() => usePages());
      expect(result.current).toStrictEqual(error);
    });

    it('should return null when data is null', () => {
      mockObservableListPages = new Observable((subscriber) => {
        subscriber.next(null);
      });

      const { result } = renderHook(() => usePages());
      expect(result.current).toBe(null);
    });

    it('should unsubscribe on unmount', () => {
      jest.spyOn(Subscription.prototype, 'unsubscribe');
      const { unmount } = renderHook(() => usePages());

      unmount();
      expect(Subscription.prototype.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('with ids', () => {
    it('should call customPageByIdStream correct number of times', () => {
      renderHook(() => usePages({ ids: [faqId, aboutId] }));

      expect(customPageByIdStream).toHaveBeenCalledTimes(2);
      expect(customPageByIdStream).toHaveBeenCalledWith(faqId);
      expect(customPageByIdStream).toHaveBeenCalledWith(aboutId);
    });

    it('should return data when data', async () => {
      const { result } = renderHook(() => usePages({ ids: [faqId, aboutId] }));

      await act(
        async () =>
          await waitFor(() =>
            expect(result.current).toEqual([faqPage, aboutPage])
          )
      );
    });

    it('should return error when one customPageByIdStream returns error', () => {
      const error = new Error();

      mockObservablecustomPageByIdStream = (id) =>
        new Observable((subscriber) => {
          id === faqId
            ? subscriber.next({ data: faqPage })
            : subscriber.next(new Error());
        });

      const { result } = renderHook(() => usePages({ ids: [faqId, aboutId] }));
      expect(result.current).toStrictEqual(error);
    });

    it('should return null when one customPageByIdStream returns null', () => {
      mockObservablecustomPageByIdStream = (id) =>
        new Observable((subscriber) => {
          id === faqId
            ? subscriber.next({ data: faqPage })
            : subscriber.next(null);
        });

      const { result } = renderHook(() => usePages({ ids: [faqId, aboutId] }));
      expect(result.current).toBe(null);
    });

    it('should unsubscribe on unmount', () => {
      jest.spyOn(Subscription.prototype, 'unsubscribe');
      const { unmount } = renderHook(() => usePages({ ids: [faqId, aboutId] }));

      unmount();
      expect(Subscription.prototype.unsubscribe).toHaveBeenCalled();
    });
  });
});
