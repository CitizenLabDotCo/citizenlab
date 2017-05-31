import { fromJS } from 'immutable';
import { makeSelectIdeas, makeSelectUser } from '../selectors';
import { stringMock, arrayMock } from 'utils/testing/constants';
import { generateResourcesUserValue, generateResourcesIdeaValue } from 'utils/testing/mocks';

describe('UsersShowPage selectors', () => {
  describe('makeSelectUser', () => {
    it('should select the currently loaded user', () => {
      const selector = makeSelectUser();

      const state = {
        // page name nested for proper conversion by fromJS
        usersShowPage: {
          user: stringMock,
        },
        resources: {
          users: {},
        },
      };

      state.resources.users[stringMock] = generateResourcesUserValue(stringMock).data;

      const id = fromJS(state).getIn(['usersShowPage', 'user']);
      const expectedResult = fromJS(state.resources.users).get(id).attributes;

      expect(selector(fromJS(state)).attributes).toEqual(expectedResult);
    });

    it('should select the currently loaded ideas', () => {
      const selector = makeSelectIdeas();

      const state = {
        // page name nested for proper conversion by fromJS
        usersShowPage: {
          ideas: arrayMock,
        },
        resources: {
          ideas: arrayMock,
        },
      };

      for (let i = 0; i < 10; i += 1) {
        state.usersShowPage.ideas.push(i.toString());
        state.resources.ideas.push(generateResourcesIdeaValue(i.toString()).data);
      }

      const expectedResult = fromJS(state.usersShowPage.ideas).map((id) => fromJS(state.resources).get(id)).toJS();

      expect(selector(fromJS(state))).toEqual(expectedResult);
    });
  });
});
