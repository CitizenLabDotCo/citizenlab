import { fromJS } from 'immutable';
import { generateResourcesTopicValue, generateResourcesAreaValue } from 'utils/testing/mocks';

import { makeSelectAreas, makeSelectTopics } from '../selectors';

describe('IdeasNewPage selectors', () => {
  const testSelector = (which) => {
    const selector = (which === 'topics'
        ? makeSelectTopics()
        : makeSelectAreas()
    );
    const generator = (which === 'topics'
        ? generateResourcesTopicValue
        : generateResourcesAreaValue
    );

    const state = {
      // page name nested for proper conversion by fromJS
      submitIdea: {},
      resources: {},
    };
    state.submitIdea[which] = {
      ids: [],
    };
    state.resources[which] = {};

    let i = 0;
    while (i < 10) {
      state.submitIdea[which].ids.push(i.toString());
      state.resources[which][i.toString()] = generator(i.toString()).data;

      i += 1;
    }

    const resourcesImm = fromJS(state.resources);
    const expectedResult = fromJS(state.submitIdea[which].ids).map((id) => resourcesImm.get(which).get(id));

    expect(selector(fromJS(state))).toEqual(expectedResult);
  };

  describe('makeSelectTopics', () => {
    it('it should return available topics', () => {
      testSelector('topics');
    });
  });

  describe('makeSelectAreas', () => {
    it('it should return available areas', () => {
      testSelector('areas');
    });
  });
});
