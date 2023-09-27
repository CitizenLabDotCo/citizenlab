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
import Link from 'utils/cl-router/Link';
import Warning from 'components/UI/Warning';
import SingleVotingInputs from './votingMethodInputs/SingleVotingInputs';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../../messages';

// typings
import { VotingMethod } from 'utils/participationContexts';
import { ApiErrors } from '../../../';
import { Multiloc } from 'typings';

// hooks
import { useLocation } from 'react-router-dom';

export interface VotingInputsProps {
  voting_method: VotingMethod | null | undefined;
  voting_min_total: number | null | undefined;
  voting_max_total: number | null | undefined;
  commenting_enabled: boolean | null | undefined;
  minTotalVotesError: string | null;
  maxTotalVotesError: string | null;
  maxVotesPerOptionError: string | null;
  voteTermError: string | null;
  voting_max_votes_per_idea?: number | null;
  voting_term_plural_multiloc?: Multiloc | null;
  voting_term_singular_multiloc?: Multiloc | null;
  handleVotingMinTotalChange: (newVotingMinTotal: string) => void;
  handleVotingMaxTotalChange: (newVotingMaxTotal: string | null) => void;
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
  voting_method,
  voting_min_total,
  voting_max_total,
  commenting_enabled,
  minTotalVotesError,
  maxTotalVotesError,
  maxVotesPerOptionError,
  voteTermError,
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
        return formatMessage(messages.multipleVotesPerOption);
      case 'single_voting':
        return formatMessage(messages.singleVotePerOption);
      case 'budgeting':
        return formatMessage(messages.budgetAllocation);
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
        <Box my="16px" width="700px">
          <Warning>
            <FormattedMessage
              {...messages.learnMoreVotingMethod}
              values={{
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
                voteTypeDescription: getVoteTypeDescription(),
                optionAnalysisArticleLink: (
                  <a
                    href="https://support.citizenlab.co/en/articles/8124630-voting-and-prioritization-methods-for-enhanced-decision-making"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage {...messages.optionAnalysisLinkText} />
                  </a>
                ),
              }}
            />
          </Warning>
        </Box>
        <SectionField>
          <SubSectionTitleWithDescription>
            <FormattedMessage {...messages.optionsToVoteOn} />
          </SubSectionTitleWithDescription>
          <FormattedMessage
            {...messages.optionsToVoteOnDescription}
            values={{
              optionsPageLink: (
                <Link to={`${pathname}/ideas`} rel="noreferrer">
                  <FormattedMessage {...messages.optionsPageText} />
                </Link>
              ),
            }}
          />
        </SectionField>
        {voting_method === 'budgeting' && (
          <BudgetingInputs
            voting_min_total={voting_min_total}
            voting_max_total={voting_max_total}
            minTotalVotesError={minTotalVotesError}
            maxTotalVotesError={maxTotalVotesError}
            apiErrors={apiErrors}
            handleMinBudgetingAmountChange={handleVotingMinTotalChange}
            handleMaxBudgetingAmountChange={handleVotingMaxTotalChange}
          />
        )}
        {voting_method === 'multiple_voting' && (
          <MultipleVotingInputs
            voting_max_total={voting_max_total}
            apiErrors={undefined}
            voteTermError={voteTermError}
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
        {voting_method === 'single_voting' && (
          <SingleVotingInputs
            voting_max_total={voting_max_total}
            apiErrors={undefined}
            maxTotalVotesError={maxTotalVotesError}
            handleMaxVotingAmountChange={handleVotingMaxTotalChange}
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
