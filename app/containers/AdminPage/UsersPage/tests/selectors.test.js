import { fromJS } from 'immutable';
import { makeSelectUsers } from '../selectors';

describe('makeSelectAdminPageDomain', () => {
  describe('makeSelectUsers', () => {
    const usersSelector = makeSelectUsers();

    it('should select the users', () => {
      const users = [];
      const mockedState = fromJS({
        adminPage: {
          'users': users
        },
        resources: {
          'users': {}
        }
      });
      expect(usersSelector(mockedState)).toEqual(users);
    });
  });
});