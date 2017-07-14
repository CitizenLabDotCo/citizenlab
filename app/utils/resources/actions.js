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

export function wrapActionWithPrefix(action, actionPrefix) {
  return (...args) => {
    const original = action(...args);
    if (actionPrefix) {
      original.type = actionPrefix + original.type;
      original.actionPrefix = actionPrefix;
    }
    return original;
  };
}
