
import { fromJS } from 'immutable';
import ideasShowReducer from '../reducer';

describe('ideasShowReducer', () => {
  it('returns the initial state', () => {
    expect(ideasShowReducer(undefined, {})).toEqual(fromJS({ idea: null }));
  });
});
