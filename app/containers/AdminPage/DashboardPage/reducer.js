/*
 *
 * AdminPages reducer
 *
 */

import { fromJS } from 'immutable';

import {
  LOAD_USERS_REPORT_REQUEST, LOAD_USERS_REPORT_SUCCESS, LOAD_USERS_REPORT_ERROR, LOAD_IDEA_TOPICS_REPORT_REQUEST,
  LOAD_IDEA_TOPICS_REPORT_SUCCESS, LOAD_IDEA_TOPICS_REPORT_ERROR, LOAD_IDEA_AREAS_REPORT_REQUEST,
  LOAD_IDEA_AREAS_REPORT_SUCCESS, LOAD_IDEA_AREAS_REPORT_ERROR,
} from './constants';

// *Page* refer to starting / ending time reference period
const initialState = fromJS({
  // dashboard-wise
  startAt: null,
  endAt: null,
  // per-graph
  newUsers: {
    loading: false,
    data: {},
    loadError: false,
  },
  ideasByTopic: {
    loading: false,
    data: {},
  },
  ideasByArea: {
    loading: false,
    data: {},
    loadError: false,
  },
});

export const setInForReport = (state, action, which, operation) => {
  switch (operation) {
    case 'request':
      return state
        .setIn([which, 'loading'], true)
        .setIn([which, 'loadError'], false);
    case 'success': {
      return state
        .setIn([which, 'data'], fromJS(action.payload.data))
        .setIn([which, 'loading'], false);
    }
    case 'error':
      return state
        .setIn([which, 'loading'], false)
        .setIn([which, 'loadError'], true);
    default:
      return state;
  }
};

function dashboardPage(state = initialState, action) {
  switch (action.type) {
    case LOAD_USERS_REPORT_REQUEST:
      return setInForReport(state, action, 'newUsers', 'request');
    case LOAD_USERS_REPORT_SUCCESS:
      return setInForReport(state, action, 'newUsers', 'success');
    case LOAD_USERS_REPORT_ERROR:
      return setInForReport(state, action, 'newUsers', 'error');
    case LOAD_IDEA_TOPICS_REPORT_REQUEST:
      return setInForReport(state, action, 'ideasByTopic', 'request');
    case LOAD_IDEA_TOPICS_REPORT_SUCCESS:
      return setInForReport(state, action, 'ideasByTopic', 'success');
    case LOAD_IDEA_TOPICS_REPORT_ERROR:
      return setInForReport(state, action, 'ideasByTopic', 'error');
    case LOAD_IDEA_AREAS_REPORT_REQUEST:
      return setInForReport(state, action, 'ideasByArea', 'request');
    case LOAD_IDEA_AREAS_REPORT_SUCCESS:
      return setInForReport(state, action, 'ideasByArea', 'success');
    case LOAD_IDEA_AREAS_REPORT_ERROR:
      return setInForReport(state, action, 'ideasByArea', 'error');
    default:
      return state;
  }
}

export default dashboardPage;
