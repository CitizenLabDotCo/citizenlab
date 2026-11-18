import React, { useState } from 'react';

import { CLError, CLErrors, IOption } from 'typings';

import { ListBoxOption } from 'design-system/ListBox';
import Select from 'design-system/Select';

import { VoteTerm, VotingMethod } from 'api/phases/types';

import projectMessages from 'containers/Admin/projects/project/messages';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { ValidationErrors } from '../../../../../typings';
import NumberSettingRow from '../_shared/NumberSettingRow';
import ReactionLimitSettings from '../_shared/ReactionLimitSettings';

import messages from './messages';
import styles from './VotingMethodPanelSettings.module.css';
import 'design-system/tokens.css';

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
  const getApiErrorMessage = useApiErrorText();
  // Kept apart from the value, so clearing the amount doesn't switch to
  // unlimited.
  const [maxVotesType, setMaxVotesType] = useState<'limited' | 'unlimited'>(
    voting_max_total ? 'limited' : 'unlimited'
  );

  const errorText = (
    validationError: string | undefined,
    apiError: CLError[] | undefined
  ) =>
    [validationError, getApiErrorMessage(apiError)].filter(Boolean).join(' ') ||
    undefined;

  const minOptions = (
    <NumberSettingRow
      id="voting_min_selected_options"
      label={formatMessage(messages.minimumOptions2)}
      value={voting_min_selected_options}
      min={0}
      onChange={handleMinVotingOptionsChange}
      errorMessage={errorText(
        validationErrors.minSelectedOptionsError,
        apiErrors?.voting_min_selected_options
      )}
    />
  );

  const maxTotalError = errorText(
    validationErrors.maxTotalVotesError,
    apiErrors?.voting_max_total
  );

  const voteTermOptions: IOption[] = Object.entries(VOTE_TERMS).map(
    ([value, label]) => ({ value, label: formatMessage(label) })
  );

  if (voting_method === 'single_voting') {
    return (
      <>
        <ReactionLimitSettings
          name="maxVotes"
          title={formatMessage(messages.maximumVotes2)}
          method={maxVotesType}
          max={voting_max_total}
          maxLabel={formatMessage(messages.numberVotesPerUser2)}
          limitedLabel={formatMessage(messages.fixedAmount)}
          onMethodChange={(method) => {
            setMaxVotesType(method);
            handleVotingMaxTotalChange(method === 'limited' ? '1' : null);
          }}
          onMaxChange={handleVotingMaxTotalChange}
          maxError={maxTotalError}
        />
        {minOptions}
      </>
    );
  }

  if (voting_method === 'multiple_voting') {
    return (
      <>
        <div className={styles.voteTerm}>
          <Select
            id="vote_term"
            label={formatMessage(messages.voteCalled2)}
            labelTooltip={formatMessage(messages.ifLeftEmpty)}
            size={32}
            value={voteTerm ?? null}
            onChange={(key) => {
              const option = voteTermOptions.find(({ value }) => value === key);
              if (option) handleVoteTermChange(option);
            }}
          >
            {voteTermOptions.map(({ value, label }) => (
              <ListBoxOption key={value} id={value}>
                {label}
              </ListBoxOption>
            ))}
          </Select>
        </div>
        <NumberSettingRow
          id="voting_max_total"
          label={formatMessage(messages.numberVotesPerUser2)}
          value={voting_max_total}
          min={1}
          onChange={handleVotingMaxTotalChange}
          errorMessage={maxTotalError}
        />
        <NumberSettingRow
          id="voting_max_votes_per_idea"
          label={formatMessage(messages.maxVotesPerOption2)}
          value={voting_max_votes_per_idea}
          min={1}
          onChange={handleMaxVotesPerOptionAmountChange}
          errorMessage={errorText(
            validationErrors.maxVotesPerOptionError,
            apiErrors?.voting_max_votes_per_idea
          )}
        />
        {minOptions}
      </>
    );
  }

  if (voting_method === 'budgeting') {
    return (
      <>
        <span className={styles.helper}>
          {formatMessage(projectMessages.totalBudget)}
        </span>
        <NumberSettingRow
          id="voting_min_total"
          label={formatMessage(projectMessages.minimum)}
          value={voting_min_total}
          min={0}
          onChange={handleVotingMinTotalChange}
          errorMessage={errorText(
            validationErrors.minTotalVotesError,
            apiErrors?.voting_min_total
          )}
        />
        <NumberSettingRow
          id="voting_max_total"
          label={formatMessage(projectMessages.maximum)}
          value={voting_max_total}
          min={1}
          onChange={handleVotingMaxTotalChange}
          errorMessage={maxTotalError}
        />
      </>
    );
  }

  return null;
};

export default VotingMethodPanelSettings;
