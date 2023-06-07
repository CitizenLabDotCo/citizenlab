import React from 'react';

// api
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Toggle, IOption } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import DefaultViewPicker from '../../shared/DefaultViewPicker';
import { ToggleRow, ToggleLabel } from '../../shared/styling';
import VotingMethodSelector from './VotingMethodSelector';
import BudgetingInputs from './votingMethodInputs/BudgetingInputs';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../../messages';

// typings
import { InputTerm, VotingMethod } from 'services/participationContexts';
import { ApiErrors } from '../../../';
import { AnonymousPostingToggle } from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';

export interface VotingInputsProps {
  isCustomInputTermEnabled: boolean;
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  allow_anonymous_participation: boolean | null | undefined;
  voting_method: VotingMethod | null | undefined;
  min_budget: number | null | undefined;
  max_budget: number | null | undefined;
  commenting_enabled: boolean | null | undefined;
  minBudgetError: string | null;
  maxBudgetError: string | null;
  handleMinBudgetingAmountChange: (newMinBudget: string) => void;
  handleMaxBudgetingAmountChange: (newMaxBudget: string) => void;
  toggleCommentingEnabled: () => void;
  apiErrors: ApiErrors;
  presentation_mode: 'card' | 'map' | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
  handleVotingMethodOnChange: (voting_method: VotingMethod) => void;
}

export default ({
  isCustomInputTermEnabled,
  input_term,
  handleInputTermChange,
  allow_anonymous_participation,
  voting_method,
  min_budget,
  max_budget,
  commenting_enabled,
  minBudgetError,
  maxBudgetError,
  handleMinBudgetingAmountChange,
  handleMaxBudgetingAmountChange,
  toggleCommentingEnabled,
  apiErrors,
  presentation_mode,
  handleIdeasDisplayChange,
  handleAllowAnonymousParticipationOnChange,
  handleVotingMethodOnChange,
}: VotingInputsProps) => {
  const hasAnonymousParticipationEnabled = useFeatureFlag({
    name: 'anonymous_participation',
  });

  return (
    <>
      <VotingMethodSelector
        voting_method={voting_method}
        handleVotingMethodOnChange={handleVotingMethodOnChange}
      />
      {hasAnonymousParticipationEnabled && (
        <AnonymousPostingToggle
          allow_anonymous_participation={allow_anonymous_participation}
          handleAllowAnonymousParticipationOnChange={
            handleAllowAnonymousParticipationOnChange
          }
        />
      )}
      {voting_method === 'budgeting' && (
        <BudgetingInputs
          min_budget={min_budget}
          max_budget={max_budget}
          input_term={input_term}
          isCustomInputTermEnabled={isCustomInputTermEnabled}
          minBudgetError={minBudgetError}
          maxBudgetError={maxBudgetError}
          apiErrors={apiErrors}
          handleInputTermChange={handleInputTermChange}
          handleMinBudgetingAmountChange={handleMinBudgetingAmountChange}
          handleMaxBudgetingAmountChange={handleMaxBudgetingAmountChange}
        />
      )}
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.actionsForResidents} />
        </SubSectionTitle>

        <ToggleRow>
          <ToggleLabel>
            <FormattedMessage {...messages.inputCommentingEnabled} />
          </ToggleLabel>
          <Toggle
            checked={commenting_enabled as boolean}
            onChange={toggleCommentingEnabled}
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
