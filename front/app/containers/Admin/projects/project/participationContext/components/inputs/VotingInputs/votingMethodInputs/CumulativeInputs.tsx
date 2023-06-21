import React from 'react';

// intl
import messages from '../messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import { Input, Box, Text } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// typing
import { ApiErrors } from '../../../..';
import { VotingAmountInputError } from '../../../shared/styling';
interface Props {
  voting_max_total?: number | null;
  voting_max_votes_per_idea?: number | null;
  apiErrors: ApiErrors;
  maxTotalVotesError: string | null;
  maxVotesPerOptionError: string | null;
  handleMaxVotingAmountChange: (newMaxTotalVote: string) => void;
  handleMaxVotesPerOptionAmountChange: (newMaxVotesPerOption: string) => void;
}

const CumulativeInputs = ({
  voting_max_total,
  voting_max_votes_per_idea,
  handleMaxVotingAmountChange,
  handleMaxVotesPerOptionAmountChange,
  apiErrors,
  maxTotalVotesError,
  maxVotesPerOptionError,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.voteCalled} />
        </SubSectionTitle>
        <Box maxWidth="300px">
          <Box mb="24px">
            <InputMultilocWithLocaleSwitcher
              label={'Singular'}
              type={'text'}
              valueMultiloc={undefined}
              placeholder={formatMessage(
                messages.voteCalledPlaceholderSingular
              )}
            />
          </Box>

          <InputMultilocWithLocaleSwitcher
            label={'Plural'}
            type={'text'}
            valueMultiloc={undefined}
            placeholder={formatMessage(messages.voteCalledPlaceholderPlural)}
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
        <Text color="textSecondary" fontSize="s">
          <FormattedMessage
            {...messages.maximumVotesRecommendation}
            values={{
              strategicVotingLink: (
                // TODO: Replace url with article link once written.
                <a href={`/`} target="_blank" rel="noreferrer">
                  <FormattedMessage {...messages.strategicVotingLinkText} />
                </a>
              ),
            }}
          />
        </Text>
      </SectionField>
    </>
  );
};

export default CumulativeInputs;
