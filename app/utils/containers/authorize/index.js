
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';

import RuleBasedRenderer from 'utils/containers/ruleBasedRenderer';

import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';
import authorizations from './authorizations';

// we mostly pass down the props to the RuleBasedRendere and the base resource (the logged User)
const mapStateToProps = () => createStructuredSelector({
  base: makeSelectCurrentUserImmutable(),
});

const mergeProps = (stateP, dispatchP, ownP) => Object.assign({}, stateP, ownP, { authorizations });

const Authorize = connect(mapStateToProps, null, mergeProps)(RuleBasedRenderer);
export default Authorize;
export { Authorize as Else };
