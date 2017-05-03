import { take, put } from 'redux-saga';

import { MERGE_JSONAPI_RESOURCES } from './constants';
import { mergeJsonApiResourcesSuccess } from './actions';

export function* resourcesMergeDispatch() {
  yield put(mergeJsonApiResourcesSuccess());
}

export function* mergeJsonApiResources() {
  yield take(MERGE_JSONAPI_RESOURCES, resourcesMergeDispatch);
}
