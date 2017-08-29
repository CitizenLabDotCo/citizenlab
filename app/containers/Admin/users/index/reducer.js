import {
  ACTION_PREFIX,
  SEARCH_TERM_CHANGED,
  SORT_COLUMN_CHANGED,
  PAGE_SELECTION_CHANGED,
  LOAD_USERS_XLSX_REQUEST,
  LOAD_USERS_XLSX_SUCCESS,
  LOAD_USERS_XLSX_ERROR,
} from './constants';
import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { makeReducerWithPrefix } from 'utils/resources/reducer';
import usersReducer from 'resources/users/reducer';

const initialState = fromJS({
  searchTerm: '',
  sortDirection: 'desc',
  sortAttribute: 'created_at',
  selectedPage: 1,
  pageSize: 10,
  exportLoading: false,
  exportError: null,
});


function ideasIndexPageUIReducer(state = initialState, action) {
  switch (action.type) {
    case SEARCH_TERM_CHANGED: {
      return state
        .set('searchTerm', action.payload)
        .set('selectedPage', 1);
    }
    case SORT_COLUMN_CHANGED: {
      if (action.payload === state.get('sortAttribute')) {
        return state
          .update('sortDirection', (d) => d === 'asc' ? 'desc' : 'asc');
      }
      return state
        .set('sortAttribute', action.payload)
        .set('sortDirection', 'desc');
    }
    case PAGE_SELECTION_CHANGED: {
      return state
        .set('selectedPage', action.payload);
    }
    case LOAD_USERS_XLSX_REQUEST: {
      return state
        .set('exportLoading', true)
        .set('exportError', null);
    }
    case LOAD_USERS_XLSX_SUCCESS: {
      return state
        .set('exportLoading', false)
        .set('exportError', null);
    }
    case LOAD_USERS_XLSX_ERROR: {
      return state
        .set('exportLoading', false)
        .set('exportError', action.payload);
    }
    default: {
      return state;
    }
  }
}

const mountedReducers = combineReducers({
  ui: ideasIndexPageUIReducer,
  users: makeReducerWithPrefix(usersReducer, ACTION_PREFIX),
});

export default mountedReducers;
