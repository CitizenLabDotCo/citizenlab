
import { fromJS } from 'immutable';
import usersEditPageReducer from '../reducer';
import { currentUserLoaded, currentUserUpdated } from '../actions';
import { expectNestedPropertyNotNull, expectPropertyNotNull } from '../../../utils/testUtils';
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

  it('should return loading set to false, currentUser not null, currentUser.avatar and currentUser.useId not null on currentUserLoaded and currentUserUpdated  actions', () => {
    let nextState;

    const apiResponse = {
      data: {
        attributes: userData,
        id: 'anything',
      },
    };

    // currentUserLoaded
    nextState = usersEditPageReducer(
      fromJS(initialState), currentUserLoaded(apiResponse)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'currentUser');
    expectNestedPropertyNotNull(nextState, 'currentUser', 'userId');
    expectNestedPropertyNotNull(nextState, 'currentUser', 'avatar');

    // currentUserUpdated
    nextState = usersEditPageReducer(
      fromJS(initialState), currentUserUpdated(apiResponse)
    ).toJS();
    expectPropertyNotNull(nextState, 'loading');
    expectPropertyNotNull(nextState, 'currentUser');
    expectNestedPropertyNotNull(nextState, 'currentUser', 'userId');
    expectNestedPropertyNotNull(nextState, 'currentUser', 'avatar');
  });
});
