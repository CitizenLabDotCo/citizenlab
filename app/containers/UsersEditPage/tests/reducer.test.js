
import { fromJS } from 'immutable';
import usersEditPageReducer from '../reducer';
import { avatarLoaded, avatarStored, currentUserLoaded, profileStored, storeProfileError } from '../actions';
import { expectPropertyNotNull } from '../../../utils/testUtils';
import { loadCurrentUser } from '../../App/actions';

describe('usersEditPageReducer', () => {
  const initialState = {
    loading: false,
    loadError: false,
    storeError: false,
    processing: false,
    stored: false,
    currentUser: { },
    avatarBase64: null,
    avatarStored: false,
    avatarLoadError: false,
    avatarStoreError: false,
  };

  const userData = {};
  const avatarBase64 = '';

  it('returns the initial state', () => {
    expect(usersEditPageReducer(undefined, {})).toEqual(fromJS(initialState));
  });

  it('should return loading set to true, on loadCurrentUser action', () => {
    const nextState = initialState;
    nextState.loading = true;

    expect(usersEditPageReducer(
      fromJS(initialState), loadCurrentUser()
    )).toEqual(fromJS(nextState));
  });

  it('should return loading set to false and currentUser not null, on currentUserLoaded, profileStored and storeProfileError actions', () => {
    let nextState;

    // currentUserLoaded
    const apiResponse = {
      payload: {
        data: {
          attributes: userData,
        },
      },
    };

    nextState = usersEditPageReducer(
      fromJS(initialState), currentUserLoaded(apiResponse)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'currentUser');

    // profileStored
    nextState = usersEditPageReducer(
      fromJS(initialState), profileStored(userData)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'currentUser');

    // storeProfileError
    nextState = usersEditPageReducer(
      fromJS(initialState), storeProfileError(userData)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'currentUser');
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
