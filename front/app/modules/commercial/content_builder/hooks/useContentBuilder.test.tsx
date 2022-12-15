import { act, renderHook } from '@testing-library/react-hooks';
import useContentBuilderLayout from './useContentBuilder';
import { Observable, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { contentBuilderLayoutStream } from '../services/contentBuilder';
import { waitFor } from 'utils/testUtils/rtl';

const projectId = 'TestID';
const code = 'TestCode';

const mockContentBuilderLayout = {
  data: {
    id: 'testID',
    type: 'content_builder_layout',
    attributes: {
      craftjs_jsonmultiloc: '',
      code: 'TextCode',
      enabled: 'true',
      created_at: '2021-05-18T16:07:49.156Z',
      updated_at: '2021-05-18T16:07:49.156Z',
    },
  },
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockContentBuilderLayout);
}).pipe(delay(1));

jest.mock('modules/commercial/content_builder/services/contentBuilder', () => {
  return {
    contentBuilderLayoutStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useContentBuilderLayout', () => {
  it('should call contentBuilderLayoutStream with correct arguments', () => {
    renderHook(() => useContentBuilderLayout({ projectId, code }));
    expect(contentBuilderLayoutStream).toHaveBeenCalledWith({
      projectId,
      code,
    });
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() =>
      useContentBuilderLayout({ projectId, code })
    );
    expect(result.current).toBe(undefined);
    await act(
      async () =>
        await waitFor(() =>
          expect(result.current).toBe(mockContentBuilderLayout)
        )
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next(new Error());
    });
    const { result } = renderHook(() =>
      useContentBuilderLayout({ projectId, code })
    );
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next(null);
    });
    const { result } = renderHook(() =>
      useContentBuilderLayout({ projectId, code })
    );
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    jest.spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() =>
      useContentBuilderLayout({ projectId, code })
    );

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
