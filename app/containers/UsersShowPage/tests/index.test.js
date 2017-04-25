import { mapDispatchToProps } from '../index';
import { loadUserRequest, loadUserIdeasRequest } from '../actions';

describe('mapDispatchToProps', () => {
  describe('loadUser', () => {
    it('should dispatch loadUserRequest', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      const userId = 'anything';
      result.loadUser(userId);
      expect(dispatch).toHaveBeenCalledWith(loadUserRequest(userId));
    });
  });

  describe('loadUserIdeas', () => {
    it('should dispatch loadUserIdeasRequest', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      const userId = 'anything';
      result.loadUserIdeas(userId);
      expect(dispatch).toHaveBeenCalledWith(loadUserIdeasRequest(userId));
    });
  });
});
