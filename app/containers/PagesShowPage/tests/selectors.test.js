import { fromJS } from 'immutable';
import { numberMock } from 'utils/testing/constants';
import { generateResourcesPageValue } from 'utils/testing/mocks';

import { makeSelectPage } from '../selectors';

describe('pageShowPage selectors', () => {
  it('it should select the currently loaded page', () => {
    const selector = makeSelectPage();

    const state = {
      // page name nested for proper conversion by fromJS
      pagesShowPage: {
        page: numberMock,
      },
      resources: {
        pages: {},
      },
    };

    state.resources.pages[numberMock] = generateResourcesPageValue(numberMock.toString()).data;

    const id = fromJS(state).getIn(['pagesShowPage', 'page']);
    const expectedResult = fromJS(state.resources.pages).get(id);

    expect(selector(fromJS(state))).toEqual(expectedResult);
  });
});
