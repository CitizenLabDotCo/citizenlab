
import {
  addIdea,
} from '../actions';
import {
  ADD_IDEA,
} from '../constants';

describe('IdeasPage actions', () => {
  describe('addIdea Action', () => {
    it('has a type of ADD_IDEA', () => {
      const expected = {
        type: ADD_IDEA,
        payload: 'some_obj',
      };
      expect(addIdea('some_obj')).toEqual(expected);
    });
  });
});
