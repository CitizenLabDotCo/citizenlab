/*
 *
 * AdminPage/DashboardPage selectors
 *
 */

// import { createSelector } from 'reselect';
// import { selectResourcesDomain } from 'utils/resources/selectors';

const selectAdminDashboard = (state) => state.get('adminDashboard');

export {
  selectAdminDashboard,
};
