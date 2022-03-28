import { renderHook } from '@testing-library/react-hooks';
import useBuilderLayout from './useContentBuilder';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { builderLayoutStream } from '../services/ContentBuilder';

const viewId = 'TestID';
const code = 'TestCode';

const mockBuilderLayout = {
  data: {
    id: 'testID',
    code: 'TestCode',
  },
};

const mockObservable = new Observable((subscriber) => {
  subscriber.next(mockBuilderLayout);
}).pipe(delay(1));

jest.mock('modules/commercial/content_builder/services/ContentBuilder', () => {
  return {
    builderLayoutStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useBuilderLayout', () => {
  it('should call BuilderContentStream with correct arguments', () => {
    renderHook(() => useBuilderLayout(viewId, code));
    expect(builderLayoutStream).toHaveBeenCalledWith(viewId, code);
  });
});
