import React from 'react';

// components
import { Toggle, IconTooltip, Text } from '@citizenlab/cl2-component-library';
import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import Error from 'components/UI/Error';
import DefaultViewPicker from '../../shared/DefaultViewPicker';
import { ToggleRow } from '../../shared/styling';
import VotingMethodSelector from './VotingMethodSelector';
import BudgetingInputs from './votingMethodInputs/BudgetingInputs';
import { StyledSectionDescription } from 'containers/Admin/initiatives/settings';
import CumulativeInputs from './votingMethodInputs/CumulativeInputs';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../../messages';

// typings
import { InputTerm, VotingMethod } from 'services/participationContexts';
import { ApiErrors } from '../../../';
import { IOption, Multiloc } from 'typings';

// hooks
import { useLocation, useParams } from 'react-router-dom';

export type VotingTerm = { singular: Multiloc; plural: Multiloc };

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
  maxVotesPerOptionError: string | null;
  voting_max_votes_per_idea?: number | null;
  handleVotingMinTotalChange: (newVotingMinTotal: string) => void;
  handleVotingMaxTotalChange: (newVotingMaxTotal: string) => void;
  handleMaxVotesPerOptionAmountChange: (newMaxVotesPerOption: string) => void;
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
  maxVotesPerOptionError,
  voting_max_votes_per_idea,
  handleVotingMinTotalChange,
  handleVotingMaxTotalChange,
  toggleCommentingEnabled,
  handleMaxVotesPerOptionAmountChange,
  apiErrors,
  presentation_mode,
  handleIdeasDisplayChange,
  handleVotingMethodOnChange,
}: VotingInputsProps) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { projectId } = useParams() as {
    projectId: string;
  };

  return (
    <>
      <VotingMethodSelector
        voting_method={voting_method}
        handleVotingMethodOnChange={handleVotingMethodOnChange}
      />
      {projectId && (
        <SectionField>
          <SubSectionTitleWithDescription>
            <FormattedMessage {...messages.optionsToVoteOn} />
            <IconTooltip content={'TODO: add tooltip content'} />
          </SubSectionTitleWithDescription>
          <StyledSectionDescription>
            <FormattedMessage
              {...messages.optionsToVoteOnDescription}
              values={{
                optionsPageLink: (
                  <a href={`${pathname}/ideas`} rel="noreferrer">
                    <FormattedMessage {...messages.optionsPageText} />
                  </a>
                ),
              }}
            />
          </StyledSectionDescription>
        </SectionField>
      )}

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
      {voting_method === 'cumulative' && (
        <CumulativeInputs
          voting_max_total={voting_max_total}
          apiErrors={undefined}
          maxTotalVotesError={maxTotalVotesError}
          maxVotesPerOptionError={maxVotesPerOptionError}
          voting_max_votes_per_idea={voting_max_votes_per_idea}
          handleMaxVotingAmountChange={handleVotingMaxTotalChange}
          handleMaxVotesPerOptionAmountChange={
            handleMaxVotesPerOptionAmountChange
          }
        />
      )}
      <SectionField>
        <SubSectionTitleWithDescription>
          <FormattedMessage {...messages.enabledActionsForUsers} />
          <IconTooltip
            content={<FormattedMessage {...messages.enabledActionsTooltip} />}
          />
        </SubSectionTitleWithDescription>
        <StyledSectionDescription>
          <FormattedMessage {...messages.enabledActionsForUsersDescription} />
        </StyledSectionDescription>

        <ToggleRow>
          <Toggle
            checked={!!commenting_enabled}
            onChange={toggleCommentingEnabled}
            label={FormattedMessage(messages.inputCommentingEnabled)}
          />
        </ToggleRow>
        <Text color={'textSecondary'} fontSize="s">
          {formatMessage(messages.commentingBias)}
        </Text>
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
