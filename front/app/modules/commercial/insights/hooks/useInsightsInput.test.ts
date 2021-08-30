import { renderHook, act } from '@testing-library/react-hooks';
import useInsightsInput from './useInsightsInput';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { insightsInputStream } from 'modules/commercial/insights/services/insightsInputs';
import inputs from 'modules/commercial/insights/fixtures/inputs';

const viewId = '1';
const inputId = inputs[0].id;
const mockInput = {
  data: inputs[0],
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockInput);
}).pipe(delay(1));

jest.mock('modules/commercial/insights/services/insightsInputs', () => {
  return {
    insightsInputStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsInput', () => {
  it('should call insightsInputStream with correct arguments', () => {
    renderHook(() => useInsightsInput(viewId, inputId));
    expect(insightsInputStream).toHaveBeenCalledWith(viewId, inputId);
  });
  it('should return data when data', async () => {
    const { result } = renderHook(() => useInsightsInput(viewId, inputId));
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    await act(
      async () =>
        await waitFor(() => expect(result.current).toBe(mockInput.data))
    );
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useInsightsInput(viewId, inputId));
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useInsightsInput(viewId, inputId));
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsInput(viewId, inputId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
