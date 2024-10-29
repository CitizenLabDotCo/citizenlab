import React from 'react';

import {
  Input,
  Box,
  Error,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { Multiloc, CLErrors } from 'typings';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { VotingAmountInputError } from '../../../shared/styling';
import messages from '../messages';

interface Props {
  voting_max_total?: number | null;
  voting_max_votes_per_idea?: number | null;
  apiErrors: CLErrors | null | undefined;
  maxTotalVotesError?: string;
  maxVotesPerOptionError?: string;
  voteTermError?: string;
  voting_term_plural_multiloc?: Multiloc | null;
  voting_term_singular_multiloc?: Multiloc | null;
  handleMaxVotingAmountChange: (newMaxTotalVote: string | null) => void;
  handleMaxVotesPerOptionAmountChange: (newMaxVotesPerOption: string) => void;
  handleVoteTermPluralChange: (termMultiloc: Multiloc) => void;
  handleVoteTermSingularChange: (termMultiloc: Multiloc) => void;
}

const MultipleVotingInputs = ({
  voting_max_total,
  voting_max_votes_per_idea,
  voting_term_plural_multiloc,
  voting_term_singular_multiloc,
  handleMaxVotingAmountChange,
  handleMaxVotesPerOptionAmountChange,
  handleVoteTermPluralChange,
  handleVoteTermSingularChange,
  apiErrors,
  maxTotalVotesError,
  maxVotesPerOptionError,
  voteTermError,
}: Props) => {
  const { formatMessage } = useIntl();

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
          <Box mb="24px">
            <InputMultilocWithLocaleSwitcher
              label={'Singular'}
              type={'text'}
              valueMultiloc={voting_term_singular_multiloc}
              placeholder={formatMessage(
                messages.voteCalledPlaceholderSingular
              )}
              onChange={handleVoteTermSingularChange}
            />
          </Box>

          <InputMultilocWithLocaleSwitcher
            label={'Plural'}
            type={'text'}
            valueMultiloc={voting_term_plural_multiloc}
            placeholder={formatMessage(messages.voteCalledPlaceholderPlural)}
            onChange={handleVoteTermPluralChange}
          />
        </Box>
        {voteTermError && (
          <Box mt="4px" maxWidth="400px">
            <Error text={voteTermError} />
          </Box>
        )}
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
