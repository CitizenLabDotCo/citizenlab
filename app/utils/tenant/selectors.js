import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectTenantDomain = (...type) => (state) => state.getIn(['tenant', ...type]);

const makeSelectCurrentTenantImm = (...type) => createSelector(
  selectTenantDomain('id'),
  selectResourcesDomain(),
  (id, resources) => resources.getIn(['tenants', id, ...type]),
);

const makeSelectCurrentTenant = (...type) => createSelector(
  selectTenantDomain('id'),
  selectResourcesDomain(),
  (id, resources) => {
    const tenant = resources.getIn(['tenants', id, ...type]);
    return tenant && tenant.toJS();
  },
);

const makeSelectSetting = (settingPath) => createSelector(
  makeSelectCurrentTenantImm(),
  (immutableTenant) => (
    immutableTenant && immutableTenant.getIn(['attributes', 'settings', ...settingPath])
  )
);

const makeSelectStyle = (prop) => createSelector(
  makeSelectCurrentTenantImm('attributes', 'settings', 'core'),
  (coreSettings) => coreSettings.get(prop)
);

export {
  selectTenantDomain,
  makeSelectCurrentTenantImm,
  makeSelectCurrentTenant,
  makeSelectSetting,
  makeSelectStyle,
};
