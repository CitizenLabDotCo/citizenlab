// import React from 'react';
import { mapDispatchToProps } from '../index';
import { publishCommentError } from '../actions';
// import { shallow } from 'enzyme';

// import { IdeasShow } from '../index';

describe('<IdeasShow />', () => {
  describe('mapDispatchToProps', () => {
    describe('publishCommentClick', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);

      it('should dispatch publishCommentError if content null', () => {
        const content = null;
        result.publishCommentClick(null, content, null, null, null);
        expect(dispatch).toHaveBeenCalledWith(publishCommentError('', null));
      });

      it('should dispatch publishCommentError if content empty', () => {
        const content = '<p></p>';
        result.publishCommentClick(null, content, null, null, null);
        expect(dispatch).toHaveBeenCalledWith(publishCommentError('', null));
      });
    });
  });
});
