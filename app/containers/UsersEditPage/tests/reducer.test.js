
import { fromJS } from 'immutable';
import usersEditPageReducer from '../reducer';
import { currentUserLoaded, currentUserUpdated, storeCurrentUserError } from '../actions';
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
    avatarStored: false,
    avatarUploadError: false,
    avatarURL: '',
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

  it('should return loading set to false and currentUser not null, on currentUserLoaded, currentUserStored and storeCurrentUserError actions', () => {
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
      fromJS(initialState), currentUserUpdated(userData)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'currentUser');

    // storeCurrentUserError
    nextState = usersEditPageReducer(
      fromJS(initialState), storeCurrentUserError(userData)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'currentUser');
  });

  it('should return avatarBase64 not null on avatarStored actions', () => {
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
