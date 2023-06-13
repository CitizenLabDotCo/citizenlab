import React from 'react';

// components
import { Toggle, IconTooltip } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import DefaultViewPicker from '../../shared/DefaultViewPicker';
import { ToggleRow } from '../../shared/styling';
import VotingMethodSelector from './VotingMethodSelector';
import BudgetingInputs from './votingMethodInputs/BudgetingInputs';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../../messages';

// typings
import { InputTerm, VotingMethod } from 'services/participationContexts';
import { ApiErrors } from '../../../';
import { IOption } from 'typings';

export interface VotingInputsProps {
  isCustomInputTermEnabled: boolean;
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  voting_method: VotingMethod | null | undefined;
  voting_min_total: number | null | undefined;
  voting_max_total: number | null | undefined;
  commenting_enabled: boolean | null | undefined;
  minTotalVotesError: string | null;
  maxTotalVotesError: string | null;
  handleVotingMinTotalChange: (newVotingMinTotal: string) => void;
  handleVotingMaxTotalChange: (newVotingMaxTotal: string) => void;
  toggleCommentingEnabled: () => void;
  apiErrors: ApiErrors;
  presentation_mode: 'card' | 'map' | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  handleVotingMethodOnChange: (voting_method: VotingMethod) => void;
}

export default ({
  isCustomInputTermEnabled,
  input_term,
  handleInputTermChange,
  voting_method,
  voting_min_total,
  voting_max_total,
  commenting_enabled,
  minTotalVotesError,
  maxTotalVotesError,
  handleVotingMinTotalChange,
  handleVotingMaxTotalChange,
  toggleCommentingEnabled,
  apiErrors,
  presentation_mode,
  handleIdeasDisplayChange,
  handleVotingMethodOnChange,
}: VotingInputsProps) => {
  return (
    <>
      <VotingMethodSelector
        voting_method={voting_method}
        handleVotingMethodOnChange={handleVotingMethodOnChange}
      />
      {voting_method === 'budgeting' && (
        <BudgetingInputs
          voting_min_total={voting_min_total}
          voting_max_total={voting_max_total}
          input_term={input_term}
          isCustomInputTermEnabled={isCustomInputTermEnabled}
          minTotalVotesError={minTotalVotesError}
          maxTotalVotesError={maxTotalVotesError}
          apiErrors={apiErrors}
          handleInputTermChange={handleInputTermChange}
          handleMinBudgetingAmountChange={handleVotingMinTotalChange}
          handleMaxBudgetingAmountChange={handleVotingMaxTotalChange}
        />
      )}
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.enabledActionsForResidents} />
          <IconTooltip
            content={<FormattedMessage {...messages.enabledActionsTooltip} />}
          />
        </SubSectionTitle>

        <ToggleRow>
          <Toggle
            checked={!!commenting_enabled}
            onChange={toggleCommentingEnabled}
            label={FormattedMessage(messages.inputCommentingEnabled)}
          />
        </ToggleRow>
        <Error apiErrors={apiErrors && apiErrors.commenting_enabled} />
      </SectionField>

      <DefaultViewPicker
        presentation_mode={presentation_mode}
        apiErrors={apiErrors}
        handleIdeasDisplayChange={handleIdeasDisplayChange}
      />
    </>
  );
};
