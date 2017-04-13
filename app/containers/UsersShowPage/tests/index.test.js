import { mapDispatchToProps } from '../index';
import { loadUser, loadUserIdeas } from '../actions';

describe('mapDispatchToProps', () => {
  describe('loadUser', () => {
    it('should dispatch loadUser', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      const userId = 'anything';
      result.loadUser(userId);
      expect(dispatch).toHaveBeenCalledWith(loadUser(userId));
    });
  });

  describe('loadUserIdeas', () => {
    it('should dispatch loadUserIdeas', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      const userId = 'anything';
      result.loadUserIdeas(userId);
      expect(dispatch).toHaveBeenCalledWith(loadUserIdeas(userId));
    });
  });
});
