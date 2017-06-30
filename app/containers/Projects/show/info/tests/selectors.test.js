import { fromJS } from 'immutable';
import { generateResourcesTopicValue } from 'utils/testing/mocks';

import { makeSelectTopics } from '../selectors';

describe('ProjectsInfo selectors', () => {
  describe('makeSelectTopics', () => {
    it('it should select project\'s phases', () => {
      const selector = makeSelectTopics();

      const state = {
        // page name nested for proper conversion by fromJS
        projectInfo: {
          topics: [],
        },
        resources: {
          topics: {},
        },
      };

      let i = 0;
      while (i < 3) {
        state.projectInfo.topics.push(i.toString());
        state.resources.topics[i.toString()] = generateResourcesTopicValue(i.toString()).data;

        i += 1;
      }

      const resourcesImm = fromJS(state.resources);
      const expectedResult = fromJS(state.projectInfo.topics).map((id) => resourcesImm.get('topics').get(id));

      expect(selector(fromJS(state))).toEqual(expectedResult);
    });
  });
});
