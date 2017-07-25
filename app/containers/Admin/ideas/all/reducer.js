import {
  LOAD_IDEAS_XLSX_ERROR,
  LOAD_IDEAS_XLSX_SUCCESS,
  LOAD_IDEAS_XLSX_REQUEST,
  LOAD_COMMENTS_XLSX_REQUEST,
  LOAD_COMMENTS_XLSX_SUCCESS,
  LOAD_COMMENTS_XLSX_ERROR,
} from './constants';
import { fromJS } from 'immutable';

const initialState = fromJS({
  exportIdeasLoading: false,
  exportCommentsLoading: false,
  exportIdeasError: null,
  exportCommentsError: null,
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS_XLSX_REQUEST: {
      return state
        .set('exportIdeasLoading', true)
        .set('exportIdeasError', null);
    }
    case LOAD_COMMENTS_XLSX_REQUEST: {
      return state
        .set('exportCommentsLoading', true)
        .set('exportCommentsError', null);
    }
    case LOAD_IDEAS_XLSX_SUCCESS: {
      return state
        .set('exportIdeasLoading', false)
        .set('exportIdeasError', null);
    }
    case LOAD_COMMENTS_XLSX_SUCCESS: {
      return state
        .set('exportCommentsLoading', false)
        .set('exportCommentsError', null);
    }
    case LOAD_IDEAS_XLSX_ERROR: {
      return state
        .set('exportIdeasLoading', false)
        .set('exportIdeasError', action.payload);
    }
    case LOAD_COMMENTS_XLSX_ERROR: {
      return state
        .set('exportCommentsLoading', false)
        .set('exportCommentsError', action.payload);
    }
    default: {
      return state;
    }
  }
}
