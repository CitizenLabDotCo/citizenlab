import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { ideasXlsxLoaded, ideasXlsxLoadError, commentsXlsxLoaded, commentsXlsxLoadError } from './actions';
import {
  LOAD_COMMENTS_XLSX_REQUEST, LOAD_IDEAS_XLSX_REQUEST,
} from './constants';
import { fetchIdeasXlsx, fetchCommentsXlsx } from 'api';
import FileSaver from 'file-saver';

// individual exports for testing
export function* getIdeasXlsx() {
  try {
    FileSaver.saveAs(yield call(fetchIdeasXlsx), 'ideas-export.xlsx');
    yield put(ideasXlsxLoaded());
  } catch (err) {
    // err is string
    yield put(ideasXlsxLoadError(err));
  }
}

export function* getCommentsXlsx() {
  try {
    FileSaver.saveAs(yield call(fetchCommentsXlsx), 'comments-export.xlsx');
    yield put(commentsXlsxLoaded());
  } catch (err) {
    // err is string
    yield put(commentsXlsxLoadError(err));
  }
}

function* watchLoadIdeasXlsx() {
  yield takeLatest(LOAD_IDEAS_XLSX_REQUEST, getIdeasXlsx);
}

function* watchLoadCommentsXlsx() {
  yield takeLatest(LOAD_COMMENTS_XLSX_REQUEST, getCommentsXlsx);
}

export default {
  watchLoadIdeasXlsx,
  watchLoadCommentsXlsx,
};
