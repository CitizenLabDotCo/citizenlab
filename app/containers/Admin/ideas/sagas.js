import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { ideasXlsxLoaded, ideasXlsxLoadError, commentsXlsxLoaded, commentsXlsxLoadError } from './actions';
import {
  LOAD_COMMENTS_XLSX_REQUEST, LOAD_IDEAS_XLSX_REQUEST,
} from './constants';
import { fetchIdeasXlsx, fetchCommentsXlsx } from 'api';
import * as FileSaver from './lib/FileSaver.min';

function* getIdeasXlsx() {
  try {
    const response = yield call(fetchIdeasXlsx);
    FileSaver.saveAs(response, 'users-export.xlsx');
    yield put(ideasXlsxLoaded());
  } catch (err) {
    // err is string
    yield put(ideasXlsxLoadError(err));
  }
}

function* getCommentsXlsx() {
  try {
    const response = yield call(fetchCommentsXlsx);
    FileSaver.saveAs(response, 'comments-export.xlsx');
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
