import normalize from 'json-api-normalizer';
import { fromJS } from 'immutable';
import { MERGE_JSONAPI_RESOURCES } from './constants';

const initialState = fromJS({});
function resourcesReducer(state = initialState, action) {
  switch (action.type) {
    case MERGE_JSONAPI_RESOURCES: {
      const mergeMap = normalize(action.payload, { camelizeKeys: false });
      let newState = state;
      Object.keys(mergeMap).forEach((resource) => {
        Object.keys(mergeMap[resource]).forEach((id) => {
          newState = newState.setIn([resource, id], fromJS(mergeMap[resource][id]));
        });
      });

      return newState;
    }
    default:
      return state;
  }
}

export default resourcesReducer;
