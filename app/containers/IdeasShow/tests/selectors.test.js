import { fromJS } from 'immutable';
import { makeSelectDownVotes, makeSelectUpVotes } from '../selectors';
import { generateResourcesVoteValue } from './__shared';

describe('IdeasShow selectors', () => {
  describe('makeSelectUpVotes', () => {
    const testVotesSelector = (mode) => {
      const votesSelector = (mode === 'up'
        ? makeSelectUpVotes()
        : makeSelectDownVotes()
      );

      const state = {
        // page name nested for proper conversion by fromJS
        ideasShow: {
          votes: [],
        },
        resources: {
          votes: [],
        },
      };

      let i = 0;
      while (i < 1) {
        if (i % 2 === 0) {
          state.ideasShow.votes.push(i);
        }
        state.resources.votes[i] = generateResourcesVoteValue(i, mode === 'up', mode === 'down').data;

        i += 1;
      }

      expect(votesSelector(fromJS(state))).toEqual(state.resources.votes);
    };

    it('should select up votes', () => {
      testVotesSelector('up');
    });
  });
});
