import React, { useState } from 'react';

import { Box, Select, Text } from '@citizenlab/cl2-component-library';
import { CLErrors, IOption } from 'typings';

import { VoteTerm, VotingMethod } from 'api/phases/types';

import projectMessages from 'containers/Admin/projects/project/messages';

import Error from 'components/UI/Error';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { ValidationErrors } from '../../../../../typings';
import NumberSettingRow from '../_shared/NumberSettingRow';
import ReactionLimitSettings from '../_shared/ReactionLimitSettings';

import messages from './messages';

const VOTE_TERMS: Record<VoteTerm, MessageDescriptor> = {
  vote: messages.voteTerm,
  point: messages.pointTerm,
  token: messages.tokenTerm,
  credit: messages.creditTerm,
  percent: messages.percentTerm,
};

interface Props {
  voting_method: VotingMethod | null | undefined;
  voting_min_total: number | null | undefined;
  voting_max_total: number | null | undefined;
  voting_max_votes_per_idea?: number | null;
  voting_min_selected_options?: number | null;
  voteTerm?: VoteTerm;
  apiErrors: CLErrors | null | undefined;
  validationErrors: ValidationErrors;
  handleVotingMinTotalChange: (value: string) => void;
  handleVotingMaxTotalChange: (value: string | null) => void;
  handleMaxVotesPerOptionAmountChange: (value: string) => void;
  handleMinVotingOptionsChange: (value: string | null) => void;
  handleVoteTermChange: (option: IOption) => void;
}

const VotingMethodPanelSettings = ({
  voting_method,
  voting_min_total,
  voting_max_total,
  voting_max_votes_per_idea,
  voting_min_selected_options,
  voteTerm,
  apiErrors,
  validationErrors,
  handleVotingMinTotalChange,
  handleVotingMaxTotalChange,
  handleMaxVotesPerOptionAmountChange,
  handleMinVotingOptionsChange,
  handleVoteTermChange,
}: Props) => {
  const { formatMessage } = useIntl();
  // Kept apart from the value, so clearing the amount doesn't switch to
  // unlimited.
  const [maxVotesType, setMaxVotesType] = useState<'limited' | 'unlimited'>(
    voting_max_total ? 'limited' : 'unlimited'
  );

  const minOptions = (
    <NumberSettingRow
      id="voting_min_selected_options"
      label={formatMessage(messages.minimumOptions)}
      value={voting_min_selected_options}
      min="0"
      onChange={handleMinVotingOptionsChange}
      error={
        <Error
          text={validationErrors.minSelectedOptionsError}
          apiErrors={apiErrors && apiErrors.voting_min_selected_options}
        />
      }
    />
  );

  const maxTotalError = (
    <Error
      text={validationErrors.maxTotalVotesError}
      apiErrors={apiErrors && apiErrors.voting_max_total}
    />
  );

  if (voting_method === 'single_voting') {
    return (
      <>
        <ReactionLimitSettings
          name="maxVotes"
          title={formatMessage(messages.maximumVotes)}
          method={maxVotesType}
          max={voting_max_total}
          maxLabel={formatMessage(messages.numberVotesPerUser)}
          onMethodChange={(method) => {
            setMaxVotesType(method);
            handleVotingMaxTotalChange(method === 'limited' ? '1' : null);
          }}
          onMaxChange={handleVotingMaxTotalChange}
          error={maxTotalError}
        />
        {minOptions}
      </>
    );
  }

  if (voting_method === 'multiple_voting') {
    return (
      <>
        <Box pb="5px">
          <Select
            id="vote_term"
            variant="bo"
            label={formatMessage(messages.voteCalled)}
            labelTooltipText={formatMessage(messages.ifLeftEmpty)}
            value={voteTerm}
            options={Object.entries(VOTE_TERMS).map(([value, label]) => ({
              value,
              label: formatMessage(label),
            }))}
            onChange={handleVoteTermChange}
          />
        </Box>
        <NumberSettingRow
          id="voting_max_total"
          label={formatMessage(messages.numberVotesPerUser)}
          value={voting_max_total}
          min="1"
          onChange={handleVotingMaxTotalChange}
          error={maxTotalError}
        />
        <NumberSettingRow
          id="voting_max_votes_per_idea"
          label={formatMessage(messages.maxVotesPerOption)}
          value={voting_max_votes_per_idea}
          min="1"
          onChange={handleMaxVotesPerOptionAmountChange}
          error={
            <Error
              text={validationErrors.maxVotesPerOptionError}
              apiErrors={apiErrors && apiErrors.voting_max_votes_per_idea}
            />
          }
        />
        {minOptions}
      </>
    );
  }

  if (voting_method === 'budgeting') {
    return (
      <>
        <Text as="span" variant="boHelper" fontSize="xs" m="0">
          {formatMessage(projectMessages.totalBudget)}
        </Text>
        <NumberSettingRow
          id="voting_min_total"
          label={formatMessage(projectMessages.minimum)}
          value={voting_min_total}
          min="0"
          onChange={handleVotingMinTotalChange}
          error={
            <Error
              text={validationErrors.minTotalVotesError}
              apiErrors={apiErrors && apiErrors.voting_min_total}
            />
          }
        />
        <NumberSettingRow
          id="voting_max_total"
          label={formatMessage(projectMessages.maximum)}
          value={voting_max_total}
          min="1"
          onChange={handleVotingMaxTotalChange}
          error={maxTotalError}
        />
      </>
    );
  }

  return null;
};

export default VotingMethodPanelSettings;
