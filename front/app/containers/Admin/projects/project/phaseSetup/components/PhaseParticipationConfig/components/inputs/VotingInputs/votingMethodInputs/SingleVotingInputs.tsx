import React, { useState } from 'react';

import { Input, Box, Radio } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { StyledSectionDescription } from '..';
import { VotingAmountInputError } from '../../../shared/styling';
import messages from '../messages';

interface Props {
  voting_max_total?: number | null;
  apiErrors: CLErrors | null | undefined;
  maxTotalVotesError?: string;
  handleMaxVotingAmountChange: (newMaxTotalVote: string | null) => void;
}

const SingleVotingInputs = ({
  voting_max_total,
  handleMaxVotingAmountChange,
  apiErrors,
  maxTotalVotesError,
}: Props) => {
  const { formatMessage } = useIntl();
  const [maxVotesType, setMaxVotesType] = useState<'limited' | 'unlimited'>(
    voting_max_total ? 'limited' : 'unlimited'
  );

  return (
    <>
      <SectionField>
        <SubSectionTitleWithDescription>
          <FormattedMessage {...messages.maximumVotes} />
        </SubSectionTitleWithDescription>
        <StyledSectionDescription>
          <FormattedMessage {...messages.maximumVotesDescription} />
        </StyledSectionDescription>
        <Box maxWidth="200px">
          <Radio
            onChange={() => {
              setMaxVotesType('unlimited');
              handleMaxVotingAmountChange(null);
            }}
            currentValue={maxVotesType}
            value={'unlimited'}
            id="unlimited"
            name={'maxVotesFieldset'}
            label={formatMessage(messages.unlimited)}
          />
          <Radio
            onChange={() => {
              setMaxVotesType('limited');
              handleMaxVotingAmountChange('1');
            }}
            currentValue={maxVotesType}
            value={'limited'}
            id="limited"
            name={'maxVotesFieldset'}
            label={formatMessage(messages.fixedAmount)}
          />
          {maxVotesType === 'limited' && (
            <Box ml="30px" maxWidth="100px">
              <Input
                value={voting_max_total?.toString()}
                onChange={handleMaxVotingAmountChange}
                type="number"
                min="1"
              />
            </Box>
          )}
        </Box>
        <VotingAmountInputError text={maxTotalVotesError} />
        <VotingAmountInputError
          apiErrors={apiErrors && apiErrors.voting_max_total}
        />
      </SectionField>
    </>
  );
};

export default SingleVotingInputs;
