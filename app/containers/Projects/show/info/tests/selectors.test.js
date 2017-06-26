import { fromJS } from 'immutable';
import { generateResourcesProjectValue } from 'utils/testing/mocks';

import { makeSelectTopics } from '../selectors';

describe('ProjectsInfo selectors', () => {
  describe('makeSelectTopics', () => {
    it('it should select project\'s phases', () => {
      const selector = makeSelectTopics();

      const state = {
        // page name nested for proper conversion by fromJS
        projectTimeline: {
          topics: [],
        },
        resources: {
          topics: {},
        },
      };

      let i = 0;
      while (i < 3) {
        state.projectTimeline.topics.push(i.toString());
        state.resources.topics[i.toString()] = generateResourcesProjectValue(i.toString()).data;

        i += 1;
      }

      const resourcesImm = fromJS(state.resources);
      const expectedResult = fromJS(state.projectTimeline.phases).map((id) => resourcesImm.get('phases').get(id));

      expect(selector(fromJS(state))).toEqual(expectedResult);
    });
  });
});
