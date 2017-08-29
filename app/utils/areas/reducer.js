import { fromJS } from 'immutable';
import { LOAD_AREAS_SUCCESS } from './constants';

const initialState = fromJS({});

function areasReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_AREAS_SUCCESS: {
      const areasIds = action.payload.areas.data.map((area) => area.id);
      return state.set('areasIds', fromJS(areasIds));
    }
    default:
      return state;
  }
}

export default areasReducer;
