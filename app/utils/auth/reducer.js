import { fromJS } from 'immutable';
import {
  LOAD_AREAS_REQUEST,
  LOAD_AREAS_SUCCESS,
  LOAD_AREAS_ERROR,
} from './constants';

const initialState = fromJS({});

function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_AREAS_REQUEST: {
      return state.set('jwt', action.payload);
    }
    case LOAD_AREAS_SUCCESS: {
      return state.set('id', action.payload.data.id);
    }
    case LOAD_AREAS_ERROR: {
      return state.delete('id');
    }
    default:
      return state;
  }
}

export default authReducer;
