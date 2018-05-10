import * as React from 'react';
import { clone } from 'lodash';
import styled from 'styled-components';

import { TRule } from './rules';
import Rule from './Rule';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import Icon from 'components/UI/Icon';


const Container = styled.div`

`;

const RulesList = styled.div`

`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  margin: 10px 0 0 60px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #044D6C;
`;

const AddIcon = styled(Icon)`
  width: 23px;
  height: 23px;
  & > path:nth-child(2) {
    fill: ${props => props.theme.colors.clBlue};
  }
  margin-right: 10px;
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
    newRules.push({});
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
        <AddButton onClick={this.handleOnAddRule}>
          <AddIcon
            name="plus-circle"
          />
          <FormattedMessage {...messages.addCondition} />
        </AddButton>
      </Container>
    );
  }
}

export default UserFilterConditions;
