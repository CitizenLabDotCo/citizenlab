import { objectMock } from 'utils/testing/constants';

import { publishPageRequest } from '../actions';
import { PUBLISH_PAGE_ERROR } from '../constants';

describe('AdminPagesNew actions', () => {
  describe('publishPageRequest', () => {
    it('should return PUBLISH_PAGE_ERROR if !contents', () => {
      expect(publishPageRequest(undefined, objectMock).type).toEqual(PUBLISH_PAGE_ERROR);
    });

    it('should return PUBLISH_PAGE_ERROR if !titles', () => {
      expect(publishPageRequest(objectMock, undefined).type).toEqual(PUBLISH_PAGE_ERROR);
    });
  });
});

