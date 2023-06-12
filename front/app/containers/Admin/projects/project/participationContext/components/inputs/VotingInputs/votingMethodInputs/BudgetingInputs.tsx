import React from 'react';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import CustomFieldPicker from '../../../shared/CustomFieldPicker';
import { LabelBudgetingInput } from '../../../shared/labels';
import {
  BudgetingAmountInput,
  BudgetingAmountInputError,
} from '../../../shared/styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../../../messages';

// typings
import { InputTerm } from 'services/participationContexts';
import { ApiErrors } from '../../../..';
import { IOption } from 'typings';

interface Props {
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  input_term?: InputTerm;
  isCustomInputTermEnabled: boolean;
  minBudgetError: string | null;
  maxBudgetError: string | null;
  apiErrors: ApiErrors;
  handleInputTermChange: (option: IOption) => void;
  handleMinBudgetingAmountChange: (newMinBudget: string) => void;
  handleMaxBudgetingAmountChange: (newMaxBudget: string) => void;
}

const BudgetingInputs = ({
  voting_min_total,
  voting_max_total,
  input_term,
  isCustomInputTermEnabled,
  minBudgetError,
  maxBudgetError,
  apiErrors,
  handleInputTermChange,
  handleMinBudgetingAmountChange,
  handleMaxBudgetingAmountChange,
}: Props) => {
  const minBudgetInputValue =
    // need to check the type because if voting_min_total is 0,
    // it'll evaluate to null
    typeof voting_min_total === 'number' ? voting_min_total.toString() : null;

  const maxBudgetInputValue =
    // maxBudget can't be lower than 1, but it's still a good practice
    // to check for type instead of relying on JS type coercion
    typeof voting_max_total === 'number' ? voting_max_total.toString() : null;

  return (
    <>
      {isCustomInputTermEnabled && (
        <CustomFieldPicker
          input_term={input_term}
          handleInputTermChange={handleInputTermChange}
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
          onChange={handleMinBudgetingAmountChange}
          type="number"
          min="0"
          value={minBudgetInputValue}
          label={
            <LabelBudgetingInput header="minimum" tooltip="minimumTooltip" />
          }
        />
        <BudgetingAmountInputError text={minBudgetError} />
        <BudgetingAmountInputError
          apiErrors={apiErrors && apiErrors.voting_min_total}
        />
      </SectionField>
      <SectionField>
        <BudgetingAmountInput
          onChange={handleMaxBudgetingAmountChange}
          type="number"
          min="1"
          value={maxBudgetInputValue}
          label={
            <LabelBudgetingInput header="maximum" tooltip="maximumTooltip" />
          }
        />
        <BudgetingAmountInputError text={maxBudgetError} />
        <BudgetingAmountInputError
          apiErrors={apiErrors && apiErrors.voting_max_total}
        />
      </SectionField>
    </>
  );
};

export default BudgetingInputs;
