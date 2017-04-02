import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectTenantDomain = () => (state) => state.get('tenant');

const makeSelectCurrentTenant = () => createSelector(
  selectTenantDomain(),
  selectResourcesDomain(),
  (tenant, resources) => {
    const immutableTenant = resources.getIn(['tenants', tenant.get('id')]);
    return immutableTenant && immutableTenant.toJS();
  }
);

export {
  selectTenantDomain,
  makeSelectCurrentTenant,
};
