import { fromJS } from 'immutable';
import { generateResourcesIdeaValue, generateResourcesVoteValue } from 'utils/testing/mocks';

import { makeSelectDownVotes, makeSelectIdea, makeSelectUpVotes } from '../selectors';

describe('IdeasShow selectors', () => {
  describe('makeSelectIdea', () => {
    it('should select the currently loaded idea', () => {
      const ideasSelector = makeSelectIdea();
      const ideaId = 'anything';

      const state = {
        // page name nested for proper conversion by fromJS
        ideasShow: {
          idea: ideaId,
        },
        resources: {
          ideas: {},
        },
      };

      state.resources.ideas[ideaId] = generateResourcesIdeaValue(ideaId).data;
      expect(ideasSelector(fromJS(state))).toEqual(state.resources.ideas[ideaId]);
    });
  });

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

  describe('makeSelectUpVotes', () => {
    it('should select up votes', () => {
      testVotesSelector('up');
    });
  });

  describe('makeSelectDownVotes', () => {
    it('should select down votes', () => {
      testVotesSelector('down');
    });
  });
});
