import {
  loadUserError, loadUserSuccess, loadUserIdeasSuccess, loadUserIdeasError,
} from '../actions';

describe('UsersShowPage actions', () => {
  const apiResponse = {
    data: {
      attributes: {},
      id: 'anything',
    },
  };

  describe('loadUserSuccess', () => {
    it('should not return loadUserError().type', () => {
      expect(loadUserSuccess(apiResponse)).not.toEqual(loadUserError());
    });
  });

  describe('loadUserIdeasSuccess', () => {
    it('should not return loadUserIdeasError().type', () => {
      expect(loadUserIdeasSuccess(apiResponse)).not.toEqual(loadUserIdeasError());
    });
  });
});
