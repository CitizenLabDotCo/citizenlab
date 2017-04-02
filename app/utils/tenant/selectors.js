import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectTenantDomain = () => (state) => state.get('tenant');

const makeSelectCurrentTenantImm = () => createSelector(
  selectTenantDomain(),
  selectResourcesDomain(),
  (tenant, resources) => resources.getIn(['tenants', tenant.get('id')])
);

const makeSelectCurrentTenant = () => createSelector(
  makeSelectCurrentTenantImm(),
  (immutableTenant) => immutableTenant && immutableTenant.toJS()
);

const makeSelectSetting = (settingPath) => createSelector(
  makeSelectCurrentTenantImm(),
  (immutableTenant) => {
    const settingImm = immutableTenant.getIn(['attributes', 'settings', ...settingPath]);
    return settingImm && settingImm.toJS();
  }
);

export {
  selectTenantDomain,
  makeSelectCurrentTenantImm,
  makeSelectCurrentTenant,
  makeSelectSetting,
};
