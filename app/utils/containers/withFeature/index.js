
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';

import RuleBasedRenderer from 'utils/containers/ruleBasedRenderer';

import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
import authorizations from './authorizations';

// we mostly pass down the props to the RuleBasedRendere and the base resource (the logged User)
const mapStateToProps = () => createStructuredSelector({
  base: (state, { feature }) => makeSelectCurrentTenantImm('attributes', 'settings', feature)(state),
});

// the WithFeatures only has to actions: the withoutFeature action; which allways returns true and the feature action.
// if a specific feature is requested the feature action is set.

const mergeProps = (stateP, dispatchP, ownP) => {
  const { feature, children } = ownP;
  const { base } = stateP;
  //console.log(base)
  let action = ['withoutFeature'];
  if (feature) action = ['feature'];
  // console.log(action)
  return { action, base, children };
};


const WithFeature = preprocess(mapStateToProps, null, mergeProps)(RuleBasedRenderer);

export default WithFeature;
export { WithFeature as Without };
