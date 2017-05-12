import { fromJS } from 'immutable';

import adminPageReducer from '../reducer';

describe('newAdminPageReducer', () => {
  const expectedInitialState = {

  };

  it('returns the initial state', () => {
    expect(adminPageReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });

  // TODO: complete with reducer cases test
});
