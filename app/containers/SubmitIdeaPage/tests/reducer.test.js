
import { fromJS } from 'immutable';
import submitIdeaPageReducer from '../reducer';

describe('submitIdeaPageReducer', () => {
  it('returns the initial state', () => {
    expect(submitIdeaPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
