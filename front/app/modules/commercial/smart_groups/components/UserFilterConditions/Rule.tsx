import React, { PureComponent, Fragment } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { pick, clone, omit } from 'lodash-es';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import FieldSelector, { FieldDescriptor } from './FieldSelector';
import messages from './messages';
import PredicateSelector from './PredicateSelector';
import { TRule, isEmailListRule, ruleTypeConstraints } from './rules';
import ValueSelector from './ValueSelector';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
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
  color: ${colors.textSecondary};
  flex: 1;
  padding: 10px 5px;
  display: flex;
  flex-direction: column;

  /* A pasted list of email addresses does not fit a third of the row. */
  &.wide {
    flex: 1 1 100%;
  }
`;

const StyledRemoveButton = styled(ButtonWithLink)``;

type Props = {
  rule: TRule;
  onChange: (rule: TRule) => void;
  onRemove: () => void;
  showLabels?: boolean;
  ruleName?: string;
};

interface State {}

class Rule extends PureComponent<Props, State> {
  handleChangeField = (fieldDescriptor: FieldDescriptor) => {
    const newRule = clone(fieldDescriptor) as TRule;
    this.props.onChange(newRule);
  };

  fieldDescriptorFromRule = (rule: TRule): FieldDescriptor => {
    return pick(rule, ['ruleType', 'customFieldId']);
  };

  handleChangePredicate = (predicate: TRule['predicate']) => {
    const newRule = { ...this.props.rule, predicate } as TRule;
    // Predicates that take the same kind of value keep it ("is one of" ->
    // "is not one of"); any other switch leaves the old value meaningless.
    const keepsValue =
      this.ruleToValueSelector(this.props.rule) ===
      this.ruleToValueSelector(newRule);

    this.props.onChange(
      keepsValue ? newRule : (omit(newRule, 'value') as TRule)
    );
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
    const hasValue = !!this.ruleToValueSelector(rule);

    return (
      <Container>
        <IconCell className={`${showLabels && 'showLabels'}`}>
          <StyledRemoveButton
            onClick={onRemove}
            icon="minus-circle"
            iconColor={colors.red500}
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
        <SelectorCell className={isEmailListRule(rule) ? 'wide' : ''}>
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
