import {
  MERGE_JSONAPI_RESOURCES,
} from './constants';

export function mergeJsonApiResources(response, resetIdeas) {
  return {
    type: MERGE_JSONAPI_RESOURCES,
    payload: response,
    resetIdeas,
  };
}
