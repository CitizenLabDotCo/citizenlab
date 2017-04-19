// import React from 'react';
import { jestFn, stringMock } from '../../../utils/testConstants';
import { mapDispatchToProps } from '../index';
import { resetVotes, voteIdea } from '../actions';
// import { shallow } from 'enzyme';

// import { IdeasShow } from '../index';

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

    describe('resetVotes', () => {
      it('it should dispatch resetVotes', () => {
        const dispatch = jestFn;
        const result = mapDispatchToProps(jestFn);
        result.resetVotes();
        expect(dispatch).toHaveBeenCalledWith(resetVotes());
      });
    });
  });
});
