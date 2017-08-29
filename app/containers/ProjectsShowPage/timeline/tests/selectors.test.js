import { fromJS } from 'immutable';
import { generateResourcesPhaseValue } from 'utils/testing/mocks';

import { makeSelectPhases } from '../selectors';

describe('ProjectsTimeline selectors', () => {
  describe('makeSelectPhases', () => {
    it('it should select project\'s phases', () => {
      const selector = makeSelectPhases();

      const state = {
        // page name nested for proper conversion by fromJS
        projectTimeline: {
          phases: [],
        },
        resources: {
          phases: {},
        },
      };

      let i = 0;
      while (i < 3) {
        state.projectTimeline.phases.push(i.toString());
        state.resources.phases[i.toString()] = generateResourcesPhaseValue(i.toString()).data;

        i += 1;
      }

      const resourcesImm = fromJS(state.resources);
      const expectedResult = fromJS(state.projectTimeline.phases).map((id) => resourcesImm.get('phases').get(id));

      expect(selector(fromJS(state))).toEqual(expectedResult);
    });
  });
});
