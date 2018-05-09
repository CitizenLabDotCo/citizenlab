import * as React from 'react';
import { clone } from 'lodash';
import styled from 'styled-components';

import { TRule } from './rules';
import Rule from './Rule';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';


const Container = styled.div`

`;

const RulesList = styled.div`

`;

type Props = {
  rules: TRule[];
  onChange: (rules: TRule[]) => void;
};

type State = {};

class UserFilterConditions extends React.PureComponent<Props, State> {

  handleOnChangeRule = (index) => (rule: TRule) => {
    const newRules = clone(this.props.rules);
    newRules.splice(index, 1, rule);
    this.props.onChange(newRules);
  }

  handleOnRemoveRule = (index) => () => {
    const newRules = clone(this.props.rules);
    newRules.splice(index, 1);
    this.props.onChange(newRules);
  }

  handleOnAddRule = () => {
    const newRules = clone(this.props.rules);
    newRules.push({ });
    this.props.onChange(newRules);
  }

  render() {
    const { rules } = this.props;
    return (
      <Container>
        <RulesList>
          {rules.map((rule, index) => (
            <Rule
              key={index}
              rule={rule}
              onChange={this.handleOnChangeRule(index)}
              onRemove={this.handleOnRemoveRule(index)}
            />
          ))}
        </RulesList>
        <Button
          icon="plus"
          onClick={this.handleOnAddRule}
        >
          <FormattedMessage {...messages.addCondition} />
        </Button>
      </Container>
    );
  }
}

export default UserFilterConditions;
