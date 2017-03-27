
import { fromJS } from 'immutable';
import usersEditPageReducer from '../reducer';
import { avatarLoaded, avatarStored, loadProfile, profileLoaded, profileStored, storeProfileError } from '../actions';

describe('usersEditPageReducer', () => {
  const initialState = {
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
  };

  const userData = {};
  const avatarBase64 = '';

  const expectPropertyNotNull = (nextState, property) => {
    expect(nextState[property]).toBeDefined();
  };

  it('returns the initial state', () => {
    expect(usersEditPageReducer(undefined, {})).toEqual(fromJS(initialState));
  });

  it('should return loading set to true, on loadProfile action', () => {
    const nextState = initialState;
    nextState.loading = true;

    expect(usersEditPageReducer(
      fromJS(initialState), loadProfile()
    )).toEqual(fromJS(nextState));
  });

  it('should return loading set to false and userData not null, on profileLoaded, profileStored and storeProfileError actions', () => {
    let nextState;

    // profileLoaded
    nextState = usersEditPageReducer(
      fromJS(initialState), profileLoaded(userData)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'userData');

    // profileStored
    nextState = usersEditPageReducer(
      fromJS(initialState), profileStored(userData)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'userData');

    // storeProfileError
    nextState = usersEditPageReducer(
      fromJS(initialState), storeProfileError(userData)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'userData');
  });

  it('should return avatarBase64 not null on avatarLoaded and avatarStored actions', () => {
    let nextState;

    // avatarLoaded
    nextState = usersEditPageReducer(
      fromJS(initialState), avatarLoaded(avatarBase64)
    ).toJS();
    expectPropertyNotNull(nextState, 'avatarBase64');

    // avatarStored
    nextState = usersEditPageReducer(
      fromJS(initialState), avatarStored(avatarBase64)
    ).toJS();
    expectPropertyNotNull(nextState, 'avatarBase64');
  });
});
