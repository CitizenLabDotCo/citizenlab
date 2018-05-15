import * as React from 'react';
import { pick, clone, omit } from 'lodash';
import styled from 'styled-components';

import { TRule } from './rules';

import FieldSelector, { FieldDescriptor } from './FieldSelector';
import PredicateSelector from './PredicateSelector';
import ValueSelector from './ValueSelector';
import Button from 'components/UI/Button';

const Container = styled.div`
  display: flex;
`;

const IconCell = styled.div`
  width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SelectorCell = styled.div`
  flex: 1;
  padding: 10px 5px;
`;

const StyledRemoveButton = styled(Button)`
  button {
    padding: 0;
  }
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

        <IconCell>
          <StyledRemoveButton
            onClick={onRemove}
            icon="minus-circle"
            style="text"
          />
        </IconCell>
        <SelectorCell>
          <FieldSelector
            field={this.fieldDescriptorFromRule(rule)}
            onChange={this.handleChangeField}
          />
        </SelectorCell>
        <SelectorCell>
          {rule.ruleType &&
            <PredicateSelector
              ruleType={rule.ruleType}
              predicate={rule.predicate}
              onChange={this.handleChangePredicate}
            />
          }
        </SelectorCell>
        <SelectorCell>
          {rule.predicate &&
            <ValueSelector
              rule={rule}
              value={rule.value}
              onChange={this.handleChangeValue}
            />
          }
        </SelectorCell>
      </Container>
    );
  }
}

export default Rule;
