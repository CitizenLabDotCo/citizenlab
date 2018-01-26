import { combineReducers } from 'redux-immutable';
import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import languageProviderReducer from 'containers/LanguageProvider/reducer';
import resourcesReducer from 'utils/resources/reducer';
import { utilsReducer, tempStateReducer } from 'utils/store/reducer';
import authReducer from 'utils/auth/reducer';
import tenantReducer from 'utils/tenant/reducer';
import { persistedDataReducer } from './persistedData';

const routeInitialState = fromJS({ locationBeforeTransitions: null });

function routeReducer(state = routeInitialState, action) {
  switch (action.type) {
    case LOCATION_CHANGE:
      return state.set('locationBeforeTransitions', fromJS(action.payload));
    default:
      return state;
  }
}

export default function createReducer(asyncReducers) {
  return combineReducers({
    goBackLink: utilsReducer,
    tempState: tempStateReducer,
    route: routeReducer,
    auth: authReducer,
    tenant: tenantReducer,
    language: languageProviderReducer,
    persistedData: persistedDataReducer,
    resources: resourcesReducer,
    ...asyncReducers,
  });
}
