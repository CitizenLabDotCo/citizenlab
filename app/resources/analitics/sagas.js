import { takeEvery, call, put } from 'redux-saga/effects';
import * as mixpanel from 'mixpanel-browser';
import { CREATE_ANALITICS_EVENT_REQUEST } from './constants';
import { createAnaliticsEventSuccess } from './actions';

export default (runSaga, trakers) => {
  function* gaSaga(action) {
    const message = action.meta.track.message;
    const attributes = action.meta.track.attributes || {};

    try {
      // Google Analytics
      // call all the trackers
      yield trakers.map((trakerName) => call(window.ga, `${trakerName}.send`, {
        hitType: 'event',
        eventCategory: message,
        eventAction: JSON.stringify(attributes),
      }));

      // Mixpanel Needs to be activated and possibly called with call or fork
      // call(mixpanel.track, message, attributes)  does not work cause track uses its internal context. Also I really don't know if it returns a promisse or not.
      mixpanel.track(message, attributes);
      yield put(createAnaliticsEventSuccess());
    } catch (e) {
      yield 'done';
    }
  }

  function* gaSagaWatcher() {
    yield takeEvery(CREATE_ANALITICS_EVENT_REQUEST, gaSaga);
    // use the following one for pattern base take.
    // yield takeEvery((action) => action.meta && action.meta.track, gaSaga);
  }

  runSaga.run(gaSagaWatcher);
};
