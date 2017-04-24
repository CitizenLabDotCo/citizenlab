import { fromJS } from 'immutable';
import { makeSelectIdeas } from '../selectors';
import { generateResourcesIdeaValue } from '../../IdeasIndexPage/tests/__shared';

describe('IdeasIndexPage selectors', () => {
  describe('makeSelectIdea', () => {
    it('should select the current loaded ideas', () => {
      const ideasSelector = makeSelectIdeas();

      const state = {
        // page name nested for proper conversion by fromJS
        ideasIndexPage: {
          ideas: [],
        },
        resources: {
          ideas: [],
        },
      };

      let i = 0;
      while (i < 5) {
        state.ideasIndexPage.ideas.push(i);
        state.resources.ideas[i] = generateResourcesIdeaValue(i).data;

        i += 1;
      }

      expect(ideasSelector(fromJS(state))).toEqual(state.resources.ideas);
    });
  });
});
