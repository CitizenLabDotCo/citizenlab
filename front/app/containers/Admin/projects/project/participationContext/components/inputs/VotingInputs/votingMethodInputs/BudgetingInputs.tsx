import React from 'react';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { LabelBudgetingInput } from '../../../shared/labels';
import {
  BudgetingAmountInput,
  VotingAmountInputError,
} from '../../../shared/styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../../../messages';

// typings
import { ApiErrors } from '../../../..';

interface Props {
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  minTotalVotesError: string | null;
  maxTotalVotesError: string | null;
  apiErrors: ApiErrors;
  handleMinBudgetingAmountChange: (newMinBudget: string) => void;
  handleMaxBudgetingAmountChange: (newMaxBudget: string) => void;
}

const BudgetingInputs = ({
  voting_min_total,
  voting_max_total,
  minTotalVotesError,
  maxTotalVotesError,
  apiErrors,
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
        <VotingAmountInputError text={minTotalVotesError} />
        <VotingAmountInputError
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
        <VotingAmountInputError text={maxTotalVotesError} />
        <VotingAmountInputError
          apiErrors={apiErrors && apiErrors.voting_max_total}
        />
      </SectionField>
    </>
  );
};

export default BudgetingInputs;
