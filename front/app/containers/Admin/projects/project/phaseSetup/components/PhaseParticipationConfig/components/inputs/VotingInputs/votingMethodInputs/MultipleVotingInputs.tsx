import React from 'react';

import {
  Input,
  Box,
  IconTooltip,
  Select,
} from '@citizenlab/cl2-component-library';
import { CLErrors, IOption } from 'typings';

import { VoteTerm } from 'api/phases/types';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import { VotingAmountInputError } from '../../../shared/styling';
import messages from '../messages';

interface Props {
  voting_max_total?: number | null;
  voting_max_votes_per_idea?: number | null;
  apiErrors: CLErrors | null | undefined;
  maxTotalVotesError?: string;
  maxVotesPerOptionError?: string;
  handleMaxVotingAmountChange: (newMaxTotalVote: string | null) => void;
  handleMaxVotesPerOptionAmountChange: (newMaxVotesPerOption: string) => void;
  handleVoteTermChange: (option: IOption) => void;
  voteTerm?: VoteTerm;
}

const MultipleVotingInputs = ({
  voting_max_total,
  voting_max_votes_per_idea,
  handleMaxVotingAmountChange,
  handleMaxVotesPerOptionAmountChange,
  apiErrors,
  maxTotalVotesError,
  maxVotesPerOptionError,
  handleVoteTermChange,
  voteTerm,
}: Props) => {
  const { formatMessage } = useIntl();

  const getVoteTermOptions = (): IOption[] => {
    const voteTerms: VoteTerm[] = ['vote', 'point', 'token', 'credit'];
    const voteTermLabels: Record<VoteTerm, MessageDescriptor> = {
      vote: messages.voteTerm,
      point: messages.pointTerm,
      token: messages.tokenTerm,
      credit: messages.creditTerm,
    };

    return voteTerms.map((voteTerm) => ({
      value: voteTerm,
      label: formatMessage(voteTermLabels[voteTerm]),
    }));
  };

  return (
    <>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.voteCalled} />
          <IconTooltip
            content={<FormattedMessage {...messages.ifLeftEmpty} />}
          />
        </SubSectionTitle>
        <Box maxWidth="300px">
          <Select
            value={voteTerm}
            options={getVoteTermOptions()}
            onChange={handleVoteTermChange}
          />
        </Box>
      </SectionField>

      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.numberVotesPerUser} />
        </SubSectionTitle>
        <Box maxWidth="200px">
          <Input
            value={voting_max_total?.toString()}
            onChange={handleMaxVotingAmountChange}
            type="number"
            min="1"
          />
        </Box>
        <VotingAmountInputError text={maxTotalVotesError} />
        <VotingAmountInputError
          apiErrors={apiErrors && apiErrors.voting_max_total}
        />
      </SectionField>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.maxVotesPerOption} />
        </SubSectionTitle>
        <Box maxWidth="200px">
          <Input
            value={voting_max_votes_per_idea?.toString()}
            onChange={handleMaxVotesPerOptionAmountChange}
            min="1"
            type="number"
          />
        </Box>
        <VotingAmountInputError text={maxVotesPerOptionError} />
        <VotingAmountInputError
          apiErrors={apiErrors && apiErrors.voting_max_votes_per_idea}
        />
      </SectionField>
    </>
  );
};

export default MultipleVotingInputs;
