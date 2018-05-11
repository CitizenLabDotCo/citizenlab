import { init as mixpanelInit } from 'mixpanel-browser';
import { CL_GA_TRACKING_ID, CL_GA_TRACKER_NAME } from 'containers/App/constants';

const getStore = {};

/* eslint-disable */
(function(i, s, o, g, r, a, m){
  i['GoogleAnalyticsObject'] = r; // Acts as a pointer to support renaming.

  // Creates an initial ga() function.
  // The queued commands will be executed once analytics.js loads.
  i[r] = i[r] || function() {
    (i[r].q = i[r].q || []).push(arguments)
  },

  // Sets the time (as an integer) this tag was executed.
  // Used for timing hits.
  i[r].l = 1 * new Date();

  // Insert the script tag asynchronously.
  // Inserts above current tag to prevent blocking in addition to using the
  // async attribute.
  a = s.createElement(o),
  m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  a.onload = () => getStore.store.dispatch({type: "@@CL2INTERNAL/GOOGLE_ANALYTICS_LOADED"})
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
// user the following script for debuggin
// https://www.google-analytics.com/analytics_debug.js
// or 
// //www.google-analytics.com/analytics.js

const getTenant = createSelector(
  (state) => state.getIn(['tenant', 'id']),
  (state) => state.getIn(['resources', 'tenants']),
  (id, tenants) => tenants && tenants.get(id),
);

const getcurrentUser = createSelector(
  (state) => state.getIn(['auth', 'id']),
  (state) => state.getIn(['resources', 'users']),
  (id, users) => users && users.get(id),
);

export const logPageView = (path, name, userId) => {
  window.ga(`${name}.send`, 'pageview', {
    hitType: 'pageview',
    page: path,
    userId
  });
};

// this will trigger twice need to add some form of debounce or create a custom memoizer

let prevPath;
const gaHitCurrentPath = (trackerName) => createSelector(
  (state) => state.getIn(['route', 'locationBeforeTransitions', 'pathname']),
  (state) => state.getIn(['auth', 'id']),
  (path, userId) => {
    if (prevPath !== path) logPageView(path, trackerName, userId)
    prevPath = path;
  },
);

let firstInitialize = true;
let unsubscribeGaTrackingInit;

const initAnalitics = (store, runSaga) => createSelector(
  getTenant,
  () => window.ga,
  (state) => state.getIn(['route', 'locationBeforeTransitions', 'pathname']),
  (tenant, ga, initialPath) => {
    if (!tenant || !ga ) return;
    let trakerNames = [CL_GA_TRACKER_NAME]

    // TODO: Get tennat's traking id!!!
    const cookieDomain = 'auto'; // TODO: replace with 'auto'

    // Citizenlab tracker
    ga('create', CL_GA_TRACKING_ID, cookieDomain, CL_GA_TRACKER_NAME);
    ga('Citizenlab2.require', 'displayfeatures', {}); // Remarketing, user info tracking and advertisting
    const clTraker = gaHitCurrentPath(CL_GA_TRACKER_NAME);
    store.subscribe(() => clTraker(store.getState())) // subscribe

    // Tenant tracker
    // TODO(?): do proper usage based on https://support.google.com/analytics/answer/3450482
    const tennatId = tenant.get('id');
    const TenantGaTrackingId = tenant.getIn(['attributes', 'settings', 'ga_tracking', 'traking_id']); // need propler traking id location
    if (TenantGaTrackingId) {
      trakerNames = trakerNames.concat(TenantGaTrackingId);
      ga('create', TenantGaTrackingId, cookieDomain, TenantGaTrackingId)
      const tenantTraker = gaHitCurrentPath(TenantGaTrackingId);
      store.subscribe(() => tenantTraker(store.getState())) // subscribe
    };

    // Mixpanel
    mixpanelInit('2899a45f48980c604de03e171f698e5c');

    // initi traking through actions only once;
    trakingSaga(runSaga, trakerNames);
    unsubscribeGaTrackingInit();
  }
);


export const createGa = (store, runSaga) => {
  getStore.store = store;
  const initializer = initAnalitics(store, runSaga);
  unsubscribeGaTrackingInit = store.subscribe(() => initializer(store.getState()));
};
