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
export const initialState = fromJS({
  // dashboard-wise
  startAt: null,
  endAt: null,
  // per-graph
  newUsers: {
    loading: false,
    values: fromJS([]),
    labels: fromJS([]),
    loadError: null,
  },
  ideasByTopic: {
    loading: false,
    values: fromJS([]),
    labels: fromJS([]),
    loadError: null,
  },
  ideasByArea: {
    loading: false,
    values: fromJS([]),
    labels: fromJS([]),
    loadError: null,
  },
});

export const setInForReport = (state, action, which, operation, isComposite) => {
  switch (operation) {
    case 'request':
      return state
        .setIn([which, 'loading'], true)
        .setIn([which, 'loadError'], null);
    case 'success': {
      if (isComposite) {
        // topics, areas, ...
        const itemValues = action.payload.values;
        const itemLabels = action.payload.labels;
        const values = Object.keys(itemValues).map((item) => itemValues[item]);
        const labelsMultiloc = Object.keys(itemLabels).map((item) => itemLabels[item].title_multiloc);
        return state
          .setIn([which, 'values'], fromJS(values))
          .setIn([which, 'labels'], fromJS(labelsMultiloc))
          .setIn([which, 'loading'], false);
      }

      // new users over time, ...
      const keys = Object.keys(action.payload);
      const labels = keys;
      const values = keys.map((key) => action.payload[key]);
      return state
        .setIn([which, 'values'], fromJS(values))
        .setIn([which, 'labels'], fromJS(labels))
        .setIn([which, 'loading'], false);
    }
    case 'error':
      return state
        .setIn([which, 'loading'], false)
        .setIn([which, 'loadError'], action.error);
    default:
      return state;
  }
};

function dashboardPage(state = initialState, action) {
  switch (action.type) {
    case LOAD_USERS_REPORT_REQUEST:
      return setInForReport(state, action, 'newUsers', 'request');
    case LOAD_USERS_REPORT_SUCCESS:
      return setInForReport(state, action, 'newUsers', 'success', false);
    case LOAD_USERS_REPORT_ERROR:
      return setInForReport(state, action, 'newUsers', 'error');
    case LOAD_IDEA_TOPICS_REPORT_REQUEST:
      return setInForReport(state, action, 'ideasByTopic', 'request');
    case LOAD_IDEA_TOPICS_REPORT_SUCCESS:
      return setInForReport(state, action, 'ideasByTopic', 'success', true);
    case LOAD_IDEA_TOPICS_REPORT_ERROR:
      return setInForReport(state, action, 'ideasByTopic', 'error');
    case LOAD_IDEA_AREAS_REPORT_REQUEST:
      return setInForReport(state, action, 'ideasByArea', 'request');
    case LOAD_IDEA_AREAS_REPORT_SUCCESS:
      return setInForReport(state, action, 'ideasByArea', 'success', true);
    case LOAD_IDEA_AREAS_REPORT_ERROR:
      return setInForReport(state, action, 'ideasByArea', 'error');
    default:
      return state;
  }
}

export default dashboardPage;
