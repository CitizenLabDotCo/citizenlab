
import { fromJS } from 'immutable';
import ideasIndexPageReducer from '../reducer';

describe('ideasIndexPageReducer', () => {
  it('returns the initial state', () => {
    expect(ideasIndexPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
