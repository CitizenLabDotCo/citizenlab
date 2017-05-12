import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
import { createSelector } from 'reselect';

const makeSelectFeature = (...type) => createSelector(
  makeSelectCurrentTenantImm(),
  (tenant) => tenant.getIn(['attributes', 'settings', ...type]),
);

export {
  makeSelectFeature,
};
