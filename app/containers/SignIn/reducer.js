import { fromJS } from 'immutable';
import { SIGNIN_USER_REQUEST, SIGNIN_USER_ERROR, LOAD_CURRENT_USER_SUCCESS } from 'utils/auth/constants';

const initialState = fromJS({
  areas: [],
  processing: false,
  success: false,
  error: false,
  user: null,
});

function SignInReducer(state = initialState, action) {
  switch (action.type) {
    case SIGNIN_USER_REQUEST: {
      return state
        .set('processing', true)
        .set('success', false)
        .set('error', false)
        .set('user', null);
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
        .set('user', null);
    }
    default:
      return state;
  }
}

export default SignInReducer;
