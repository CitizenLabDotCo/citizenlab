import { takeLatest, select, put } from 'redux-saga/effects';
import { SEARCH_TERM_CHANGED, PAGE_SELECTION_CHANGED, SORT_COLUMN_CHANGED, ACTION_PREFIX, INITIAL_LOAD } from './constants';
import { loadUsersRequest } from 'resources/users/actions';
import { wrapActionWithPrefix } from 'utils/resources/actions';

const wrappedLoadUsersRequest = wrapActionWithPrefix(loadUsersRequest, ACTION_PREFIX);

export function* handleFilterSettingsChanged() {
  const domainUIState = yield select((state) => state.getIn(['adminUsersIndex', 'ui']));
  const sortSign = domainUIState.get('sortDirection') === 'desc' ? '-' : '';
  yield put(wrappedLoadUsersRequest({
    'page[number]': domainUIState.get('selectedPage'),
    'page[size]': domainUIState.get('pageSize'),
    search: domainUIState.get('searchTerm'),
    sort: `${sortSign}${domainUIState.get('sortAttribute')}`,
  }));
}

function* watchSearchTermChanged() {
  yield takeLatest([SEARCH_TERM_CHANGED, PAGE_SELECTION_CHANGED, SORT_COLUMN_CHANGED, INITIAL_LOAD], handleFilterSettingsChanged);
}

export default {
  watchSearchTermChanged,
};
