import { fromJS } from 'immutable';
import { generateResourcesPageValue } from 'utils/testing/mocks';
import { makeSelectPages } from '../selectors';

describe('AdminPages selectors', () => {
  describe('makeSelectPages', () => {
    it('it should select the currently loaded pages', () => {
      const selector = makeSelectPages();

      const state = {
        // page name nested for proper conversion by fromJS
        adminPages: {
          pages: [],
        },
        resources: {
          pages: {},
        },
      };

      let i = 0;
      while (i < 10) {
        state.adminPages.pages.push(i.toString());
        state.resources.pages[i.toString()] = generateResourcesPageValue(i.toString()).data;

        i += 1;
      }

      const resourcesImm = fromJS(state.resources);
      const expectedResult = fromJS(state.adminPages.pages).map((id) => resourcesImm.get('pages').get(id));

      expect(selector(fromJS(state))).toEqual(expectedResult);
    });
  });
});
