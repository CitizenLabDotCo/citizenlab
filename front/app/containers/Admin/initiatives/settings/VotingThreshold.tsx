import React from 'react';

// components
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { Input } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';
import { StyledWarning } from '.';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { injectIntl } from 'react-intl';
import messages from '../messages';
import { WrappedComponentProps } from 'react-intl';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const VotingThreshold = ({
  value,
  onChange,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const handleVotingTresholdOnChange = (value: string) => {
    onChange(parseInt(value, 10));
  };

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.fieldVotingThreshold} />
      </SubSectionTitle>
      <StyledWarning>
        <FormattedMessage {...messages.warningTresholdSettings} />
      </StyledWarning>
      <Input
        className="e2e-voting-threshold"
        name="voting_threshold"
        type="number"
        min="2"
        required={true}
        value={value.toString()}
        onChange={handleVotingTresholdOnChange}
      />

      {isNaN(value) && <Error text={formatMessage(errorMessages.blank)} />}

      {!isNaN(value) && value < 2 && (
        <Error
          text={formatMessage(messages.initiativeSettingsVotingThresholdError)}
        />
      )}
    </SectionField>
  );
};

export default injectIntl(VotingThreshold);
