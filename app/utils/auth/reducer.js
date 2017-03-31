import { fromJS } from 'immutable';
import { STORE_JWT, LOAD_CURRENT_USER_SUCCESS } from './constants';

const initialState = fromJS({});

function authReducer(state = initialState, action) {
  switch (action.type) {
    case STORE_JWT: {
      return state.set('jwt', action.payload);
    }
    case LOAD_CURRENT_USER_SUCCESS: {
      return state.set('id', action.payload.data.id);
    }
    default:
      return state;
  }
}

export default authReducer;
