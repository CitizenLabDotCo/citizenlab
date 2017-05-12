import { all, call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { loadIdeasSuccess, loadIdeasError } from './actions';
import { LOAD_IDEAS_REQUEST } from './constants';
import { fetchIdeas, fetchTopics, fetchAreas } from '../../../api';
import { mergeJsonApiResources } from '../../../utils/resources/actions';

function* getIdeas(action) {
  try {
    const pageCount = action.pageCount;

    if (action.initialLoad) {
      console.log(all);
      const [ideasResponse, topicsResponse, areasResponse] = yield all([
        call(fetchIdeas, null, { 'page[number]': action.nextPageNumber, 'page[size]': action.nextPageItemCount }),
        call(fetchTopics),
        call(fetchAreas),
      ]);

      console.log(ideasResponse);
      console.log(topicsResponse);
      console.log(areasResponse);

      yield put(mergeJsonApiResources(ideasResponse));
      yield put(mergeJsonApiResources(topicsResponse));
      yield put(mergeJsonApiResources(areasResponse));
      yield put(loadIdeasSuccess(ideasResponse, pageCount));
    } else {
      const ideasResponse = yield call(fetchIdeas, null, { 'page[number]': action.nextPageNumber, 'page[size]': action.nextPageItemCount });

      yield put(mergeJsonApiResources(ideasResponse));
      yield put(loadIdeasSuccess(ideasResponse, pageCount));
    }
  } catch (err) {
    console.log('error:');
    console.log(err);
    yield put(loadIdeasError(err));
  }
}

export function* watchLoadIdeas() {
  yield takeLatest(LOAD_IDEAS_REQUEST, getIdeas);
}
