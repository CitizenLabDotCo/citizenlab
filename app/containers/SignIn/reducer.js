import { fromJS } from 'immutable';
import { SIGNIN_USER_REQUEST, SIGNIN_USER_ERROR, LOAD_CURRENT_USER_SUCCESS } from 'utils/auth/constants';

const immutableNull = fromJS(null);

const initialState = fromJS({
  areas: [],
  processing: false,
  success: false,
  error: false,
  user: immutableNull,
});

function SignInReducer(state = initialState, action) {
  switch (action.type) {
    case SIGNIN_USER_REQUEST: {
      return state
        .set('processing', true)
        .set('success', false)
        .set('error', false)
        .set('user', immutableNull);
    }
    case LOAD_CURRENT_USER_SUCCESS: {
      const user = action.payload.user;
      return state
        .set('processing', false)
        .set('success', true)
        .set('error', false)
        .set('user', fromJS(user));
    }
    case SIGNIN_USER_ERROR: {
      const error = action.payload.error;
      return state
        .set('processing', false)
        .set('success', false)
        .set('error', fromJS(error))
        .set('user', immutableNull);
    }
    default:
      return state;
  }
}

export default SignInReducer;
