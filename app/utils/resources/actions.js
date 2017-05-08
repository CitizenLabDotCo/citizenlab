import {
  MERGE_JSONAPI_RESOURCES, MERGE_JSONAPI_RESOURCES_SUCCESS,
} from './constants';

export function mergeJsonApiResources(response) {
  return {
    type: MERGE_JSONAPI_RESOURCES,
    payload: response,
  };
}

export function mergeJsonApiResourcesSuccess() {
  return {
    type: MERGE_JSONAPI_RESOURCES_SUCCESS,
  };
}
