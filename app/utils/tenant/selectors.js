import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectTenantDomain = (...type) => (state) => state.getIn(['tenant', ...type]);

const makeSelectCurrentTenantImm = (...type) => createSelector(
  selectAuthDomain('id'),
  selectResourcesDomain(),
  (id, resources) => resources.getIn(['users', id, ...type]),
);

const makeSelectSetting = (settingPath) => createSelector(
  makeSelectCurrentTenantImm(),
  (immutableTenant) => (
    immutableTenant.getIn(['attributes', 'settings', ...settingPath])
  )
);

export {
  selectTenantDomain,
  makeSelectCurrentTenantImm,
  makeSelectCurrentTenant,
  makeSelectSetting,
};
