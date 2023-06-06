import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import CustomFieldPicker from '../../../shared/CustomFieldPicker';
import { LabelBudgetingInput } from '../../../labels';
import {
  BudgetingAmountInput,
  BudgetingAmountInputError,
} from '../../../shared/styling';
import { VotingInputsProps } from '..';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../../../messages';

type BudgetingInputsProps = {
  props: VotingInputsProps;
};

const BudgetingInputs = ({ props }: BudgetingInputsProps) => {
  const minBudgetInputValue =
    // need to check the type because if min_budget is 0,
    // it'll evaluate to null
    typeof props.min_budget === 'number' ? props.min_budget.toString() : null;
  const maxBudgetInputValue =
    // maxBudget can't be lower than 1, but it's still a good practice
    // to check for type instead of relying on JS type coercion
    typeof props.max_budget === 'number' ? props.max_budget.toString() : null;

  return (
    <>
      {props.isCustomInputTermEnabled && (
        <CustomFieldPicker
          input_term={props.input_term}
          handleInputTermChange={props.handleInputTermChange}
          inputTermOptions={props.inputTermOptions}
        />
      )}
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.totalBudget} />
          <IconTooltip
            content={<FormattedMessage {...messages.totalBudgetExplanation} />}
          />
        </SubSectionTitle>
        <BudgetingAmountInput
          onChange={props.handleMinBudgetingAmountChange}
          type="number"
          min="0"
          value={minBudgetInputValue}
          label={
            <LabelBudgetingInput header="minimum" tooltip="minimumTooltip" />
          }
        />
        <BudgetingAmountInputError text={props.minBudgetError} />
        <BudgetingAmountInputError
          apiErrors={props.apiErrors && props.apiErrors.min_budget}
        />
      </SectionField>
      <SectionField>
        <BudgetingAmountInput
          onChange={props.handleMaxBudgetingAmountChange}
          type="number"
          min="1"
          value={maxBudgetInputValue}
          label={
            <LabelBudgetingInput header="maximum" tooltip="maximumTooltip" />
          }
        />
        <BudgetingAmountInputError text={props.maxBudgetError} />
        <BudgetingAmountInputError
          apiErrors={props.apiErrors && props.apiErrors.max_budget}
        />
      </SectionField>
    </>
  );
};

export default BudgetingInputs;
