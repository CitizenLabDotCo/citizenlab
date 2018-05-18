import * as React from 'react';
import { clone } from 'lodash';
import styled from 'styled-components';

import { TRule } from './rules';
import Rule from './Rule';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';


const Container = styled.div``;

const RulesList = styled.div`
  margin: 0 -5px;
`;

const AddButton = styled(Button)`
  margin: 5px 0 0 60px;
  button {
    padding-left: 0;
  }
  path:nth-child(2) {
    fill: ${props => props.theme.colors.clBlue};
  }
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
        <AddButton
          onClick={this.handleOnAddRule}
          icon="plus-circle"
          style="text"
        >
          <FormattedMessage {...messages.addCondition} />
        </AddButton>
      </Container>
    );
  }
}

export default UserFilterConditions;

import { FieldProps } from 'formik';

export class FormikUserFilterConditions extends React.Component<Props & FieldProps> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  }

  render() {
    const { value } = this.props.field;
    return (
      <UserFilterConditions
        {...this.props}
        onChange={this.handleOnChange}
        rules={value}
      />
    );
  }
}
