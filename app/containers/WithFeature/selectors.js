import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
import { createSelector } from 'reselect';

const makeSelectFeature = () => createSelector(
  makeSelectCurrentTenantImm(),
  (state, props) => props.feature,
  (tenant, feature) => tenant.getIn(['attributes', 'settings', feature])
);

export {
  makeSelectFeature,
};
