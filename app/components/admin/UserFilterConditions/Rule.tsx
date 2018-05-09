import * as React from 'react';
import { pick, clone, omit } from 'lodash';
import styled from 'styled-components';

import { TRule } from './rules';

import Button from 'components/UI/Button';
import FieldSelector, { FieldDescriptor } from './FieldSelector';
import PredicateSelector from './PredicateSelector';
import ValueSelector from './ValueSelector';
// import messages from './messages';

const Container = styled.div`

`;

type Props = {
  rule: TRule;
  onChange: (rule: TRule) => void;
  onRemove: () => void;
};

type State = {};

class Rule extends React.Component<Props, State> {

  handleChangeField = (fieldDescriptor: FieldDescriptor) => {
    const newRule = clone(fieldDescriptor) as TRule;
    this.props.onChange(newRule);
  }

  fieldDescriptorFromRule = (rule: TRule): FieldDescriptor => {
    return pick(rule, ['ruleType', 'customFieldId']);
  }

  handleChangePredicate = (predicate: TRule['predicate']) => {
    const newRule = omit({ ...this.props.rule, predicate }, 'value') as TRule;
    this.props.onChange(newRule);
  }

  handleChangeValue = (value: any) => {
    const newRule = { ...this.props.rule, value };
    this.props.onChange(newRule);
  }

  render() {
    const { rule, onRemove } = this.props;
    return (
      <Container>
        <Button
          onClick={onRemove}
          icon="delete"
        />
        <FieldSelector
          field={this.fieldDescriptorFromRule(rule)}
          onChange={this.handleChangeField}
        />
        {rule.ruleType &&
          <PredicateSelector
            ruleType={rule.ruleType}
            predicate={rule.predicate}
            onChange={this.handleChangePredicate}
          />
        }
        {rule.predicate &&
          <ValueSelector
            rule={rule}
            value={rule.value}
            onChange={this.handleChangeValue}
          />
        }
      </Container>
    );
  }
}

export default Rule;
