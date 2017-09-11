import normalize from 'json-api-normalizer';
import { fromJS } from 'immutable';
import { MERGE_JSONAPI_RESOURCES } from './constants';

const initialState = fromJS({
  bySlug: {},
});
function resourcesReducer(state = initialState, action) {
  switch (action.type) {
    case MERGE_JSONAPI_RESOURCES: {
      let newState = state;

      if (action.payload) {
        const mergeMap = normalize(action.payload, { camelizeKeys: false });

        Object.keys(mergeMap).forEach((resource) => {
          Object.keys(mergeMap[resource]).forEach((id) => {
            newState = newState.setIn([resource, id], fromJS(mergeMap[resource][id]));
            const slug = mergeMap[resource][id].attributes && mergeMap[resource][id].attributes.slug;
            if (slug) {
              newState = newState.setIn(['bySlug', resource, slug], id);
            }
          });
        });
      }

      return newState;
    }
    default:
      return state;
  }
}

export function makeReducerWithPrefix(reducer, actionPrefix) {
  return (state, action) => reducer(state, action, actionPrefix);
}

export default resourcesReducer;
