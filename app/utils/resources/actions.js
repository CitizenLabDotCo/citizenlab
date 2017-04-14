import {
  MERGE_JSONAPI_RESOURCES,
} from './constants';

export function mergeJsonApiResources(response) {
  return {
    type: MERGE_JSONAPI_RESOURCES,
    payload: response,
  };
}
