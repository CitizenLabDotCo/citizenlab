import { fromJS } from 'immutable';
import {
  AUTHENTICATE_EMAIL_REQUEST,
  AUTHENTICATE_EMAIL_SUCCESS,
  AUTHENTICATE_EMAIL_ERROR,
  AUTHENTICATE_SOCIAL_REQUEST,
  AUTHENTICATE_SOCIAL_SUCCESS,
  AUTHENTICATE_SOCIAL_ERROR,
} from './constants';

const initialState = fromJS({
  authRequestPending: false,
});

function signInPageReducer(state = initialState, action) {
  switch (action.type) {
    case AUTHENTICATE_EMAIL_REQUEST: {
      return state
        .set('authRequestPending', true);
    }
    case AUTHENTICATE_EMAIL_SUCCESS: {
      return state
        .set('authRequestPending', false);
    }
    case AUTHENTICATE_EMAIL_ERROR: {
      return state
        .set('authRequestPending', false);
    }
    case AUTHENTICATE_SOCIAL_REQUEST: {
      return state
        .set('authRequestPending', true);
    }
    case AUTHENTICATE_SOCIAL_SUCCESS: {
      return state
        .set('authRequestPending', false);
    }
    case AUTHENTICATE_SOCIAL_ERROR: {
      return state
        .set('authRequestPending', false);
    }
    default:
      return state;
  }
}

export default signInPageReducer;
