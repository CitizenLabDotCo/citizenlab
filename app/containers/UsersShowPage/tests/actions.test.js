import { userIdeasLoaded, userIdeasLoadError, userLoaded, userLoadError } from '../actions';
describe('UsersShowPage actions', () => {
  const apiResponse = {
    data: {
      attributes: {},
      id: 'anything',
    },
  };

  describe('userLoaded', () => {
    it('should not return userLoadError().type', () => {
      expect(userLoaded(apiResponse)).not.toEqual(userLoadError());
    });
  });

  describe('userIdeasLoaded', () => {
    it('should not return userIdeasLoadError().type', () => {
      expect(userIdeasLoaded(apiResponse)).not.toEqual(userIdeasLoadError());
    });
  });
});
