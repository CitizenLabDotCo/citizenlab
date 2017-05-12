import { fromJS } from 'immutable';

import adminPageReducer from '../reducer';

describe('newAdminPageReducer', () => {
  const expectedInitialState = {
    publishing: false,
    invalidFormError: false,
    publishError: null,
    published: false,
    title: '',
  };

  it('returns the initial state', () => {
    expect(adminPageReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });
});
