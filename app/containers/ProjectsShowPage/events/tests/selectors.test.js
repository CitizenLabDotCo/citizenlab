import { fromJS } from 'immutable';
import { generateResourcesEventValue } from 'utils/testing/mocks';

import { makeSelectEvents } from '../selectors';

describe('ProjectsEvents selectors', () => {
  describe('makeSelectEvents', () => {
    it('it should select project\'s events', () => {
      const selector = makeSelectEvents();

      const state = {
        // page name nested for proper conversion by fromJS
        projectEvents: {
          events: [],
        },
        resources: {
          events: {},
        },
      };

      let i = 0;
      while (i < 3) {
        state.projectEvents.events.push(i.toString());
        state.resources.events[i.toString()] = generateResourcesEventValue(i.toString()).data;

        i += 1;
      }

      const resourcesImm = fromJS(state.resources);
      const expectedResult = fromJS(state.projectEvents.events).map((id) => resourcesImm.get('events').get(id));

      expect(selector(fromJS(state))).toEqual(expectedResult);
    });
  });
});
