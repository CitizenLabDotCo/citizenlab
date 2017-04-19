import { jestFn, stringMock } from '../../../utils/testConstants';
import { mapDispatchToProps } from '../index';
import { voteIdea, publishCommentError } from '../actions';

describe('<IdeasShow />', () => {
  describe('mapDispatchToProps', () => {
    describe('submitIdeaVote', () => {
      it('it should dispatch voteIdea', () => {
        const dispatch = jestFn;
        const result = mapDispatchToProps(dispatch);
        result.submitIdeaVote(stringMock, stringMock, stringMock);
        expect(dispatch).toHaveBeenCalledWith(voteIdea(stringMock, stringMock, stringMock));
      });
    });

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
