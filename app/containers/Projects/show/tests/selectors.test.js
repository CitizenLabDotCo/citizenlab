import { fromJS } from 'immutable';
import { generateResourcesPageValue } from 'utils/testing/mocks';

import { makeSelectProjectPages } from '../selectors';

describe('ProjectsTimeline selectors', () => {
  describe('makeSelectProjectPages', () => {
    it('it should select project\'s pages', () => {
      const selector = makeSelectProjectPages();

      const state = {
        // page name nested for proper conversion by fromJS
        projectContainer: {
          pages: [],
        },
        resources: {
          pages: {},
        },
      };

      let i = 0;
      while (i < 3) {
        state.projectContainer.pages.push(i.toString());
        state.resources.pages[i.toString()] = generateResourcesPageValue(i.toString()).data;

        i += 1;
      }

      const resourcesImm = fromJS(state.resources);
      const expectedResult = fromJS(state.projectContainer.pages).map((id) => resourcesImm.get('pages').get(id));

      expect(selector(fromJS(state))).toEqual(expectedResult);
    });
  });
});
