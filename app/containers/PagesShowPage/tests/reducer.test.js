
import { fromJS } from 'immutable';
import pagesShowPageReducer from '../reducer';

describe('pagesShowPageReducer', () => {
  it('returns the initial state', () => {
    expect(pagesShowPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
