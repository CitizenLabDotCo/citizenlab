
import { fromJS } from 'immutable';
import ideasPageReducer from '../reducer';

describe('ideasPageReducer', () => {
  it('returns the initial state', () => {
    expect(ideasPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
