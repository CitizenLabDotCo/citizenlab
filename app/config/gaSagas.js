import { takeEvery, call } from 'redux-saga/effects';
// import * as mixpanel from 'mixpanel-browser';

export default (runSaga, trakers) => {
  function* gaSaga(action) {
    const message = action.meta.tracking.message;
    const attributes = action.meta.tracking.attributes || {};
    const trakerType = action.meta.tracking.tracker || 'cl';
    const trakerName = trakers[trakerType];

    // Google Analytics
    const ga = window.ga;
    try {
      yield call(ga, `${trakerName}.send`, {
        hitType: 'event',
        eventCategory: message,
        eventAction: JSON.stringify(attributes),
      });

      // Mixpanel Needs to be activated and possibly called with call or fork
      // mixpanel.track(message, attributes);
    } catch (e) {
      yield 'done';
    }
  }

  function* gaSagaWatcher() {
    yield takeEvery((action) => action.meta && action.meta.tracking && window.ga, gaSaga);
  }

  runSaga.run(gaSagaWatcher);
};
