import React from 'react';

// components
import {
  Toggle,
  IconTooltip,
  Text,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';
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
import MultipleVotingInputs from './votingMethodInputs/MultipleVotingInputs';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../../messages';

// typings
import { InputTerm, VotingMethod } from 'services/participationContexts';
import { ApiErrors } from '../../../';
import { IOption, Multiloc } from 'typings';

// hooks
import { useLocation } from 'react-router-dom';
import Warning from 'components/UI/Warning';

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
  voting_term_plural_multiloc?: Multiloc | null;
  voting_term_singular_multiloc?: Multiloc | null;
  handleVotingMinTotalChange: (newVotingMinTotal: string) => void;
  handleVotingMaxTotalChange: (newVotingMaxTotal: string) => void;
  handleMaxVotesPerOptionAmountChange: (newMaxVotesPerOption: string) => void;
  handleVoteTermPluralChange: (termMultiloc: Multiloc) => void;
  handleVoteTermSingularChange: (termMultiloc: Multiloc) => void;
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
  voting_term_plural_multiloc,
  voting_term_singular_multiloc,
  handleVotingMinTotalChange,
  handleVotingMaxTotalChange,
  toggleCommentingEnabled,
  handleMaxVotesPerOptionAmountChange,
  handleVoteTermPluralChange,
  handleVoteTermSingularChange,
  apiErrors,
  presentation_mode,
  handleIdeasDisplayChange,
  handleVotingMethodOnChange,
}: VotingInputsProps) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  const getVoteTypeDescription = () => {
    switch (voting_method) {
      case 'multiple_voting':
        return formatMessage(messages.multipleVotesPerOption, {
          b: (chunks: string) => (
            <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
          ),
        });
      case 'single_voting':
        return formatMessage(messages.singleVotePerOption, {
          b: (chunks) => (
            <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
          ),
        });
      case 'budgeting':
        return formatMessage(messages.budgetAllocation, {
          b: (chunks) => (
            <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
          ),
        });
      default:
        return '';
    }
  };

  return (
    <>
      <VotingMethodSelector
        voting_method={voting_method}
        handleVotingMethodOnChange={handleVotingMethodOnChange}
      />
      <Box paddingLeft="32px" borderLeft={`1px solid ${colors.divider}`}>
        <Box mt="16px" width="700px">
          <Warning>
            <FormattedMessage
              {...messages.learnMoreVotingMethod}
              values={{
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
                voteTypeDescription: getVoteTypeDescription(),
                optionAnalysisArticleLink: (
                  // TODO: Replace with article when ready
                  <a href={'/'} target="_blank" rel="noreferrer">
                    <FormattedMessage {...messages.optionAnalysisLinkText} />
                  </a>
                ),
              }}
            />
          </Warning>
        </Box>
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
        {voting_method !== 'budgeting' && (
          <SectionField>
            <SubSectionTitleWithDescription>
              <FormattedMessage {...messages.optionsToVoteOn} />
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
        {voting_method === 'multiple_voting' && (
          <MultipleVotingInputs
            voting_max_total={voting_max_total}
            apiErrors={undefined}
            maxTotalVotesError={maxTotalVotesError}
            maxVotesPerOptionError={maxVotesPerOptionError}
            voting_max_votes_per_idea={voting_max_votes_per_idea}
            voting_term_plural_multiloc={voting_term_plural_multiloc}
            voting_term_singular_multiloc={voting_term_singular_multiloc}
            handleMaxVotingAmountChange={handleVotingMaxTotalChange}
            handleMaxVotesPerOptionAmountChange={
              handleMaxVotesPerOptionAmountChange
            }
            handleVoteTermPluralChange={handleVoteTermPluralChange}
            handleVoteTermSingularChange={handleVoteTermSingularChange}
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
          <Text mb="0px" pb="0px" color={'textSecondary'} fontSize="s">
            {formatMessage(messages.commentingBias)}
          </Text>
          <Error apiErrors={apiErrors && apiErrors.commenting_enabled} />
        </SectionField>

        <DefaultViewPicker
          presentation_mode={presentation_mode}
          apiErrors={apiErrors}
          handleIdeasDisplayChange={handleIdeasDisplayChange}
          title={messages.defaultViewOptions}
        />
      </Box>
    </>
  );
};
