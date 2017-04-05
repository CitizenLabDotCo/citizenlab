import { fromJS } from 'immutable';
import { LOAD_CURRENT_TENANT_SUCCESS } from './constants';

const initialState = fromJS({});

function tenantReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_CURRENT_TENANT_SUCCESS: {
      return state.set('id', action.payload.data.id);
    }
    default:
      return state;
  }
}

export default tenantReducer;
