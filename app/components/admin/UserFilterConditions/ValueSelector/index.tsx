import * as React from 'react';
import { TRule, ruleTypeConstraints } from '../rules';
// import { flow } from 'lodash';
// import styled from 'styled-components';

// import { FormattedMessage } from 'utils/cl-intl';
// import messages from './messages';

type Props = {
  rule: TRule,
  value: any,
  onChange: (value: any) => void;
};

type State = {};

class ValueSelector extends React.Component<Props, State> {

  ruleToValueSelector = (rule: TRule) => {
    if (rule.ruleType) {
      const ruleType = rule.ruleType;
      if (rule.predicate) {
        return ruleTypeConstraints[ruleType][rule.predicate];
      }
    }
  }

  render() {
    const ValueComponent = this.ruleToValueSelector(this.props.rule);
    return ValueComponent && (
      <ValueComponent
        {...this.props}
      />
    );
  }
}

export default ValueSelector;
