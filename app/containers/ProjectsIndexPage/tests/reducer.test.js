
import { fromJS } from 'immutable';
import projectsIndexPageReducer from '../reducer';

describe('projectsIndexPageReducer', () => {
  it('returns the initial state', () => {
    expect(projectsIndexPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
