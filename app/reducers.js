/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { combineReducers } from 'redux-immutable';
import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import languageProviderReducer from 'containers/LanguageProvider/reducer';
import usersEditPageReducer from 'containers/UsersEditPage/reducer';
import resourcesReducer from 'utils/resources/reducer';
import { utilsReducer, tempStateReducer } from 'utils/store/reducer';

import authReducer from 'utils/auth/reducer';
import areasReducer from 'utils/areas/reducer';
import tenantReducer from 'utils/tenant/reducer';
import { persistedDataReducer } from './persistedData';

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to react-router-redux@4
 *
 */

// Initial routing state
const routeInitialState = fromJS({ locationBeforeTransitions: null });

/**
 * Merge route into the global application state
 */
function routeReducer(state = routeInitialState, action) {
  switch (action.type) {
    /* istanbul ignore next */
    case LOCATION_CHANGE:
      return state.set('locationBeforeTransitions', fromJS(action.payload));
    default:
      return state;
  }
}


/**
 * Creates the main reducer with the asynchronously loaded ones
 */

export default function createReducer(asyncReducers) {
  return combineReducers({
    goBackLink: utilsReducer,
    tempState: tempStateReducer,
    route: routeReducer,
    auth: authReducer,
    areas: areasReducer,
    tenant: tenantReducer,
    language: languageProviderReducer,
    persistedData: persistedDataReducer,
    resources: resourcesReducer,
    profile: usersEditPageReducer,
    ...asyncReducers,
  });
}
