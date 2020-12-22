import React, { PureComponent, Fragment } from 'react';
import { pick, clone, omit } from 'lodash-es';
import FieldSelector, { FieldDescriptor } from './FieldSelector';
import PredicateSelector from './PredicateSelector';
import ValueSelector from './ValueSelector';
import Button from 'components/UI/Button';
import { TRule, ruleTypeConstraints } from './rules';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
`;

const IconCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 5px;
  padding-right: 5px;

  &.showLabels {
    margin-top: 15px;
  }
`;

const SelectorCell = styled.div`
  color: ${colors.label};
  flex: 1;
  padding: 10px 5px;
  display: flex;
  flex-direction: column;
`;

const StyledRemoveButton = styled(Button)``;

type Props = {
  rule: TRule;
  onChange: (rule: TRule) => void;
  onRemove: () => void;
  showLabels?: boolean;
  ruleName?: string;
};

type State = {};

class Rule extends PureComponent<Props, State> {
  handleChangeField = (fieldDescriptor: FieldDescriptor) => {
    const newRule = clone(fieldDescriptor) as TRule;
    this.props.onChange(newRule);
  };

  fieldDescriptorFromRule = (rule: TRule): FieldDescriptor => {
    return pick(rule, ['ruleType', 'customFieldId']);
  };

  handleChangePredicate = (predicate: TRule['predicate']) => {
    const newRule = omit({ ...this.props.rule, predicate }, 'value') as TRule;
    this.props.onChange(newRule);
  };

  handleChangeValue = (value: any) => {
    const newRule = { ...this.props.rule, value };
    this.props.onChange(newRule);
  };

  ruleToValueSelector = (rule: TRule) => {
    if (rule.ruleType) {
      const ruleType = rule.ruleType;

      if (rule.predicate) {
        return ruleTypeConstraints[ruleType][rule.predicate];
      }
    }
  };

  render() {
    const { rule, onRemove, showLabels, ruleName } = this.props;
    const hasValue =
      rule.ruleType && rule.predicate
        ? ruleTypeConstraints[rule.ruleType as any][rule.predicate]
        : true;

    return (
      <Container>
        <IconCell className={`${showLabels && 'showLabels'}`}>
          <StyledRemoveButton
            onClick={onRemove}
            icon="minus-circle"
            buttonStyle="text"
            padding="0"
          />
        </IconCell>
        <SelectorCell>
          {showLabels && <FormattedMessage {...messages.rulesFormLabelField} />}
          <FieldSelector
            field={this.fieldDescriptorFromRule(rule)}
            onChange={this.handleChangeField}
            fieldName={`${ruleName}-field-e2e`}
          />
        </SelectorCell>
        <SelectorCell>
          {rule.ruleType && (
            <Fragment key={rule.ruleType}>
              {showLabels && (
                <FormattedMessage {...messages.rulesFormLabelPredicate} />
              )}
              <PredicateSelector
                ruleType={rule.ruleType}
                selectedPredicate={rule.predicate}
                onChange={this.handleChangePredicate}
              />
            </Fragment>
          )}
        </SelectorCell>
        <SelectorCell>
          {rule.predicate && (
            <Fragment key={rule.ruleType}>
              {showLabels && hasValue && (
                <FormattedMessage {...messages.rulesFormLabelValue} />
              )}
              <ValueSelector
                rule={rule}
                value={(rule as any).value}
                onChange={this.handleChangeValue}
              />
            </Fragment>
          )}
        </SelectorCell>
      </Container>
    );
  }
}

export default Rule;
