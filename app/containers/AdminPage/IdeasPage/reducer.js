import { fromJS } from 'immutable';
import _ from 'lodash';
import {
  LOAD_IDEAS_REQUEST, LOAD_IDEAS_SUCCESS, LOAD_IDEAS_ERROR,
} from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../../../utils/paginationUtils';

const initialState = fromJS({
  ideas: {
    ids: [],
    loading: false,
    loaded: false,
    error: false,
  },
  firstPageNumber: null,
  firstPageItemCount: null,
  prevPageNumber: null,
  prevPageItemCount: null,
  currentPageNumber: null,
  currentPageItemCount: null,
  nextPageNumber: null,
  nextPageItemCount: null,
  lastPageNumber: null,
  lastPageItemCount: null,
  pageCount: null,
});

function IdeasPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS_REQUEST:
      return state
        .setIn(['ideas', 'loading'], true)
        .setIn(['ideas', 'loaded'], false)
        .setIn(['ideas', 'error'], false);
    case LOAD_IDEAS_SUCCESS: {
      const ids = action.payload.ideas.data.map((idea) => idea.id);
      const firstPageNumber = getPageNumberFromUrl(action.payload.ideas.links.first);
      const firstPageItemCount = getPageItemCountFromUrl(action.payload.ideas.links.first);
      const prevPageNumber = getPageNumberFromUrl(action.payload.ideas.links.prev);
      const prevPageItemCount = getPageItemCountFromUrl(action.payload.ideas.links.prev);
      const currentPageNumber = getPageNumberFromUrl(action.payload.ideas.links.self);
      const currentPageItemCount = getPageItemCountFromUrl(action.payload.ideas.links.self);
      const nextPageNumber = getPageNumberFromUrl(action.payload.ideas.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.ideas.links.next);
      const lastPageNumber = getPageNumberFromUrl(action.payload.ideas.links.last);
      const lastPageItemCount = getPageItemCountFromUrl(action.payload.ideas.links.last);

      let pageCount = 1;
      if (_.isNumber(lastPageNumber)) {
        pageCount = lastPageNumber;
      } else if (_.isNumber(action.payload.pageCount)) {
        pageCount = action.payload.pageCount;
      }

      return state
        .setIn(['ideas', 'ids'], fromJS(ids))
        .setIn(['ideas', 'loaded'], true)
        .setIn(['ideas', 'loading'], false)
        .setIn(['ideas', 'error'], false)
        .set('firstPageNumber', firstPageNumber)
        .set('firstPageItemCount', firstPageItemCount)
        .set('prevPageNumber', prevPageNumber)
        .set('prevPageItemCount', prevPageItemCount)
        .set('currentPageNumber', currentPageNumber)
        .set('currentPageItemCount', currentPageItemCount)
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('lastPageNumber', lastPageNumber)
        .set('lastPageItemCount', lastPageItemCount)
        .set('pageCount', pageCount);
    }
    case LOAD_IDEAS_ERROR:
      return state
        .setIn(['ideas', 'loading'], false)
        .setIn(['ideas', 'error'], true)
        .setIn(['ideas', 'loaded'], false);
    default:
      return state;
  }
}

export default IdeasPageReducer;
