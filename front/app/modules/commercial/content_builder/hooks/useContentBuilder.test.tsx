import { renderHook } from '@testing-library/react-hooks';
import useBuilderLayout from './useContentBuilder';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

const mockBuilderLayout = {
  data: undefined,
};

const mockObservable = new Observable((subscriber) => {
  subscriber.next(mockBuilderLayout);
}).pipe(delay(1));

jest.mock('modules/commercial/content_builder/services/ContentBuilder', () => {
  return {
    BuilderContentStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useBuilderLayout', () => {
  it('should call BuilderContentStream with correct arguments', async () => {
    renderHook(() => useBuilderLayout('', ''));
    // Empty test placeholder for now.
  });
});
