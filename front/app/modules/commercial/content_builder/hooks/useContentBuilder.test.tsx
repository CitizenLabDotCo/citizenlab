import { renderHook } from '@testing-library/react-hooks';
import useContentBuilderLayout from './useContentBuilder';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { contentBuilderLayoutStream } from '../services/ContentBuilder';

const projectId = 'TestID';
const code = 'TestCode';

const mockContentBuilderLayout = {
  data: {
    id: 'testID',
    code: 'TestCode',
  },
};

const mockObservable = new Observable((subscriber) => {
  subscriber.next(mockContentBuilderLayout);
}).pipe(delay(1));

jest.mock('modules/commercial/content_builder/services/ContentBuilder', () => {
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
    renderHook(() => useContentBuilderLayout(projectId, code));
    expect(contentBuilderLayoutStream).toHaveBeenCalledWith(projectId, code);
  });
});
