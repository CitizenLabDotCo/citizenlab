import { fromJS } from 'immutable';
import { LOADED_CURRENT_TENANT, LOAD_CURRENT_USER } from 'containers/App/constants';

const initialState = fromJS({
  currentTenant: null,
  currentUser: null,
});

export const persistedDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADED_CURRENT_TENANT:
      return state.set('currentTenant', fromJS(action.payload));
    case LOAD_CURRENT_USER:
      return state.set('currentUser', fromJS(action.payload));
    default:
      return state;
  }
};

export const loadState = () => {
  try {
    const serializedState = window.localStorage.getItem('persistedData');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    window.localStorage.setItem('persistedData', serializedState);
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
};

const selectPersistedDataDomain = () => (state) => state.get('persistedData');

export {
  selectPersistedDataDomain,
};
