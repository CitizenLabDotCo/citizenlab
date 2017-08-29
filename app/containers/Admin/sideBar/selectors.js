import { createSelector } from 'reselect';

const selectTenants = (state) => state.getIn(['resources', 'tenants']);
const selectCurrentTenantID = (state) => state.getIn(['tenant', 'id']);

const makeSelectCurrentTenant = () => createSelector(
  selectCurrentTenantID,
  selectTenants,
  (tenantID, tenants) => tenants.get(tenantID)
);

export {
  makeSelectCurrentTenant,
};
