
import { fromJS } from 'immutable';
import notifcationMenuReducer from '../reducer';

describe('notifcationMenuReducer', () => {
  it('returns the initial state', () => {
    expect(notifcationMenuReducer(undefined, {})).toEqual(fromJS({}));
  });
});
