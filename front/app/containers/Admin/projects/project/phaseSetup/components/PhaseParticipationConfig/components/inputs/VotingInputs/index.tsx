import React from 'react';

import {
  Toggle,
  IconTooltip,
  Text,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { CLErrors, IOption } from 'typings';

import { VoteTerm, VotingMethod } from 'api/phases/types';

import {
  SectionDescription,
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../../../../../../messages';
import { ValidationErrors } from '../../../../../typings';
import DefaultViewPicker from '../../shared/DefaultViewPicker';
import SimilarityDetectionConfig from '../../shared/SimilarityDetectionConfig';
import { ToggleRow } from '../../shared/styling';

import BudgetingInputs from './votingMethodInputs/BudgetingInputs';
import MultipleVotingInputs from './votingMethodInputs/MultipleVotingInputs';
import ShareResultsToggle from './votingMethodInputs/ShareResultsToggle/ShareResultsToggle';
import SingleVotingInputs from './votingMethodInputs/SingleVotingInputs';
import VotingMethodSelector from './VotingMethodSelector';

export const StyledSectionDescription = styled(SectionDescription)`
  margin-top: 0;
  margin-bottom: 20px;
`;

export interface VotingInputsProps {
  voting_method: VotingMethod | null | undefined;
  voting_min_total: number | null | undefined;
  voting_max_total: number | null | undefined;
  commenting_enabled: boolean | null | undefined;
  autoshare_results_enabled: boolean | null | undefined;
  voting_max_votes_per_idea?: number | null;
  voting_min_selected_options?: number | null;
  handleMinVotingOptionsChange: (newMinVotingOptions: string | null) => void;
  handleVotingMinTotalChange: (newVotingMinTotal: string) => void;
  handleVotingMaxTotalChange: (newVotingMaxTotal: string | null) => void;
  handleMaxVotesPerOptionAmountChange: (newMaxVotesPerOption: string) => void;
  handleVoteTermChange: (option: IOption) => void;
  voteTerm?: VoteTerm;
  toggleCommentingEnabled: () => void;
  toggleAutoshareResultsEnabled: () => void;
  apiErrors: CLErrors | null | undefined;
  validationErrors: ValidationErrors;
  presentation_mode: 'card' | 'map' | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  handleVotingMethodOnChange: (voting_method: VotingMethod) => void;
  similarity_enabled?: boolean | null;
  similarity_threshold_title: number | null | undefined;
  similarity_threshold_body: number | null | undefined;
  handleSimilarityEnabledChange: (value: boolean) => void;
  handleThresholdChange: (
    field: 'similarity_threshold_title' | 'similarity_threshold_body',
    value: number
  ) => void;
}

const VotingInputs = ({
  voting_method,
  voting_min_total,
  voting_max_total,
  voting_min_selected_options,
  commenting_enabled,
  autoshare_results_enabled,
  voting_max_votes_per_idea,
  handleVotingMinTotalChange,
  handleVotingMaxTotalChange,
  toggleCommentingEnabled,
  toggleAutoshareResultsEnabled,
  handleMaxVotesPerOptionAmountChange,
  handleMinVotingOptionsChange,
  apiErrors,
  validationErrors,
  presentation_mode,
  handleIdeasDisplayChange,
  handleVotingMethodOnChange,
  similarity_enabled,
  similarity_threshold_title,
  similarity_threshold_body,
  handleSimilarityEnabledChange,
  handleThresholdChange,
  handleVoteTermChange,
  voteTerm,
}: VotingInputsProps) => {
  const { formatMessage } = useIntl();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

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
                    href="https://support.govocal.com/en/articles/8124630-voting-and-prioritization-methods-for-enhanced-decision-making"
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
          {phaseId ? (
            <FormattedMessage
              {...messages.optionsToVoteOnDescription}
              values={{
                optionsPageLink: (
                  <Link
                    to={`/admin/projects/${projectId}/phases/${phaseId}/ideas`}
                    rel="noreferrer"
                  >
                    <FormattedMessage {...messages.optionsPageText} />
                  </Link>
                ),
              }}
            />
          ) : (
            <FormattedMessage {...messages.optionsToVoteOnDescWihoutPhase} />
          )}
        </SectionField>
        {voting_method === 'budgeting' && (
          <BudgetingInputs
            voting_min_total={voting_min_total}
            voting_max_total={voting_max_total}
            minTotalVotesError={validationErrors.minTotalVotesError}
            maxTotalVotesError={validationErrors.maxTotalVotesError}
            apiErrors={apiErrors}
            handleMinBudgetingAmountChange={handleVotingMinTotalChange}
            handleMaxBudgetingAmountChange={handleVotingMaxTotalChange}
          />
        )}
        {voting_method === 'multiple_voting' && (
          <MultipleVotingInputs
            voting_max_total={voting_max_total}
            apiErrors={apiErrors}
            maxTotalVotesError={validationErrors.maxTotalVotesError}
            maxVotesPerOptionError={validationErrors.maxVotesPerOptionError}
            voting_max_votes_per_idea={voting_max_votes_per_idea}
            handleMaxVotingAmountChange={handleVotingMaxTotalChange}
            handleMaxVotesPerOptionAmountChange={
              handleMaxVotesPerOptionAmountChange
            }
            handleVoteTermChange={handleVoteTermChange}
            voteTerm={voteTerm}
          />
        )}
        {voting_method === 'single_voting' && (
          <SingleVotingInputs
            voting_max_total={voting_max_total}
            voting_min_selected_options={voting_min_selected_options}
            apiErrors={apiErrors}
            maxTotalVotesError={validationErrors.maxTotalVotesError}
            handleMaxVotingAmountChange={handleVotingMaxTotalChange}
            handleMinVotingOptionsChange={handleMinVotingOptionsChange}
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

        <ShareResultsToggle
          autoshare_results_enabled={autoshare_results_enabled}
          toggleAutoshareResultsEnabled={toggleAutoshareResultsEnabled}
          apiErrors={apiErrors}
        />

        <SimilarityDetectionConfig
          apiErrors={apiErrors}
          similarity_enabled={similarity_enabled}
          similarity_threshold_title={similarity_threshold_title}
          similarity_threshold_body={similarity_threshold_body}
          handleSimilarityEnabledChange={handleSimilarityEnabledChange}
          handleThresholdChange={handleThresholdChange}
        />

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

export default VotingInputs;
