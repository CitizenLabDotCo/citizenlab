import { renderHook } from '@testing-library/react-hooks';
import useContentBuilderLayout from './useContentBuilder';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { contentBuilderLayoutStream } from '../services/contentBuilder';

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
    renderHook(() => useContentBuilderLayout({ id: projectId, code }));
    expect(contentBuilderLayoutStream).toHaveBeenCalledWith(projectId, code);
  });
});
