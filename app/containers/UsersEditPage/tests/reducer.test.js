
import { fromJS } from 'immutable';
import usersEditPageReducer from '../reducer';

describe('usersEditPageReducer', () => {
  it('returns the initial state', () => {
    expect(usersEditPageReducer(undefined, {})).toEqual(fromJS({
      loading: false,
      loadError: false,
      storeError: false,
      processing: false,
      stored: false,
      userData: { },
      avatarBase64: null,
      avatarStored: false,
      avatarLoadError: false,
      avatarStoreError: false,
    }));
  });

  it('should return loading set to true, on LOAD_PROFILE action', () => {
    // TODO
    expect(true).toEqual(true);
  });

  it('should return loading set to false and userData not null, on LOAD_PROFILE_SUCCESS, PROFILE_STORE_SUCCESS and PROFILE_STORE_ERROR actions', () => {
    // TODO
    expect(true).toEqual(true);
  });
});
