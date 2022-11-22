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

const VotingThreshold = ({ value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const [votingThresholdChanged, setVotingThresholdChanged] = useState(false);

  const handleVotingTresholdOnChange = (value: string) => {
    onChange(parseInt(value, 10));
    setVotingThresholdChanged(true);
  };

  return (
    <SectionField>
      <SubSectionTitle>
        {formatMessage(messages.fieldVotingThreshold)}
      </SubSectionTitle>
      <Box mb="10px">
        <Input
          className="e2e-voting-threshold"
          name="voting_threshold"
          type="number"
          min="2"
          required={true}
          value={value.toString()}
          onChange={handleVotingTresholdOnChange}
        />
      </Box>
      {votingThresholdChanged && (
        <StyledWarning>
          {formatMessage(messages.warningTresholdSettings)}
        </StyledWarning>
      )}

      {isNaN(value) && <Error text={formatMessage(errorMessages.blank)} />}

      {!isNaN(value) && value < 2 && (
        <Error
          text={formatMessage(messages.initiativeSettingsVotingThresholdError)}
        />
      )}
    </SectionField>
  );
};

export default VotingThreshold;
