import { createSelector } from 'reselect';
// import * as mixpanel from 'mixpanel-browser';
import trakingSaga from './gaSagas';

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
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics_debug.js', 'ga');
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

export const logPageView = (path, name) => {
  // console.log(path)
  window.ga(`${name}.send`, 'pageview', {
    hitType: 'pageview',
    page: path,
    // hitCallback: () => console.log('hit')
  });
};

const gaHitCurrentPath = (trackerName) => createSelector(
  (state) => state.getIn(['route', 'locationBeforeTransitions', 'pathname']),
  (path) => {
    logPageView(path, trackerName)
  },
);

const initialized = false;
const clTrakerName = 'Citizenlab2';

let tenantTrakerName;

let unsubscribeAnalitics;

const initAnalitics = (store, runSaga) => createSelector(
  getTenant,
  getcurrentUser,
  () => window.ga,
  (state) => state.getIn(['route', 'locationBeforeTransitions', 'pathname']),
  (tenant, user, ga, initialPath) => {
    if (!tenant || !ga ) return;
    // TODO: Get tennat's traking id!!!
    const cookieDomain = 'auto'; // TODO: replace with 'auto'

    // Citizenlab tracker
    const userId = user && user.get('id');
    const clGaTrackingId = 'UA-65562281-44';
    ga('create', clGaTrackingId, { userId, cookieDomain, name: clTrakerName });
    ga('Citizenlab2.require', 'displayfeatures', {}); // Remarketing, user info tracking and advertisting
    //logPageView(initialPath, clTrakerName) // initial page view
    const clTraker = gaHitCurrentPath(clTrakerName)
    store.subscribe(() => clTraker(store.getState())) // subscribe
    // Tenant tracker
    // TODO(?): do proper usage based on https://support.google.com/analytics/answer/3450482
    const tennatId = tenant.get('id');
    const TenantGaTrackingId = tenant.tracking_id; // need propler traking id location
    if (TenantGaTrackingId) { // not needed if we get traking id
      ga('create', TenantGaTrackingId, cookieDomain, tennatId)
      logPageView(initialPath, TenantGaTrackingId) // initial page view
      const tenantTraker = gaHitCurrentPath(TenantGaTrackingId)
      store.subscribe(() => tenantTraker(store.getState())) // subscribe
    };


    /*
     * Mixpanel
     */
    // mixpanel.init('2899a45f48980c604de03e171f698e5c');

    // initi traking through actions
    trakingSaga(runSaga, { cl: clTrakerName, tenant: tennatId });

    unsubscribeAnalitics();
  }
);


export const createGa = (store, runSaga) => {
  const initializer = initAnalitics(store, runSaga);
  unsubscribeAnalitics = store.subscribe(() => initializer(store.getState()));
};
