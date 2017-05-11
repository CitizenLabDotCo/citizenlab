
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';

import RuleBasedRenderer from 'utils/containers/ruleBasedRenderer';

import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';
import authorizations from './authorizations';


const mapStateToProps = () => createStructuredSelector({
  base: makeSelectCurrentUserImmutable(),
});

const mergeProps = (stateP, dispatchP, ownP) => Object.assign({}, stateP, ownP, { authorizations });

const Authorize = preprocess(mapStateToProps, null, mergeProps)(RuleBasedRenderer);
export default Authorize;
export { Authorize as Else };
