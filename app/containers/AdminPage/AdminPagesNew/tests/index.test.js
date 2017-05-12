import { objectMock } from 'utils/testing/constants';

import { mapDispatchToProps } from '../index';
import { publishPageRequest, setFormError, setTitle } from '../actions';

describe('<IdeasNewPage />', () => {
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    const result = mapDispatchToProps(dispatch);

    describe('publishPageRequest', () => {
      it('should dispatch publishPageRequest if contents and titles are defined', () => {
        result.publishPageRequest(objectMock, objectMock);
        expect(dispatch).toHaveBeenCalledWith(publishPageRequest(objectMock, objectMock));
      });
    });

    describe('setFormError', () => {
      it('should dispatch setFormError', () => {
        result.setFormError();
        expect(dispatch).toHaveBeenCalledWith(setFormError());
      });
    });

    describe('setTitle', () => {
      it('should dispatch setTitle', () => {
        result.setTitle();
        expect(dispatch).toHaveBeenCalledWith(setTitle());
      });
    });
  });
});
