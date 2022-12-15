import React, { useState } from 'react';

// components
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { Input, Box } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';
import { StyledWarning } from '.';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const VotingLimit = ({ value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const [votingLimitChanged, setVotingLimitChanged] = useState(false);

  const handleDaysLimitOnChange = (value: string) => {
    onChange(parseInt(value, 10));
    setVotingLimitChanged(true);
  };

  return (
    <SectionField>
      <SubSectionTitle>
        {formatMessage(messages.fieldVotingDaysLimit)}
      </SubSectionTitle>
      <Box mb="10px">
        <Input
          className="e2e-days-limit"
          name="days_limit"
          type="number"
          min="1"
          required={true}
          value={value.toString()}
          onChange={handleDaysLimitOnChange}
        />
      </Box>
      {votingLimitChanged && (
        <StyledWarning>
          {formatMessage(messages.warningTresholdSettings)}
        </StyledWarning>
      )}
      {isNaN(value) && <Error text={formatMessage(errorMessages.blank)} />}
    </SectionField>
  );
};

export default VotingLimit;
