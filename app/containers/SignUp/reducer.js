import { fromJS } from 'immutable';
import { CREATE_USER_REQUEST, CREATE_USER_SUCCESS, CREATE_USER_ERROR } from 'utils/auth/constants';

const immNull = fromJS(null);

const initialState = fromJS({
  processing: false,
  success: false,
  error: false,
  user: immNull,
});

function SignUpReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_USER_REQUEST: {
      return state
        .set('processing', true)
        .set('success', false)
        .set('error', false)
        .set('user', immNull);
    }
    case CREATE_USER_SUCCESS: {
      const user = action.payload.user;
      return state
        .set('processing', false)
        .set('success', true)
        .set('error', false)
        .set('user', fromJS(user));
    }
    case CREATE_USER_ERROR: {
      const error = action.payload.error;
      return state
        .set('processing', false)
        .set('success', false)
        .set('error', fromJS(error))
        .set('user', immNull);
    }
    default:
      return state;
  }
}

export default SignUpReducer;
