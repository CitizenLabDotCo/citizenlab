import { takeLatest, select, put, call } from 'redux-saga/effects';
import { loadUsersRequest } from 'resources/users/actions';
import { wrapActionWithPrefix } from 'utils/resources/actions';
import { fetchUsersXlsx } from 'api';
import FileSaver from 'file-saver';

import {
  SEARCH_TERM_CHANGED,
  PAGE_SELECTION_CHANGED,
  SORT_COLUMN_CHANGED,
  ACTION_PREFIX,
  INITIAL_LOAD,
  LOAD_USERS_XLSX_REQUEST,
} from './constants';
import { loadUsersXlsxSuccess, loadUsersXlsxError } from './actions';

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

function* watchFilterSettingsChanged() {
  yield takeLatest([SEARCH_TERM_CHANGED, PAGE_SELECTION_CHANGED, SORT_COLUMN_CHANGED, INITIAL_LOAD], handleFilterSettingsChanged);
}

export function* getUsersXlsx() {
  try {
    FileSaver.saveAs(yield call(fetchUsersXlsx), 'users-export.xlsx');
    yield put(loadUsersXlsxSuccess());
  } catch (err) {
    yield put(loadUsersXlsxError(err));
  }
}
function* watchLoadUsersXlsx() {
  yield takeLatest(LOAD_USERS_XLSX_REQUEST, getUsersXlsx);
}

export default {
  watchFilterSettingsChanged,
  watchLoadUsersXlsx,
};
