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
    // console.log(s2ab(btoa(response)));
    const blob = new Blob(
       [response],
       { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    );
    FileSaver.saveAs(blob);
    yield put(ideasXlsxLoaded());
  } catch (err) {
    yield put(ideasXlsxLoadError(err.json.errors));
  }
}

function* getCommentsXlsx() {
  try {
    const response = yield call(fetchCommentsXlsx);
    FileSaver.saveAs(new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' }));
    yield put(commentsXlsxLoaded());
  } catch (err) {
    yield put(commentsXlsxLoadError(err.json.errors));
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
