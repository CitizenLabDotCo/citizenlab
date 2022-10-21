import React from 'react';

// components
import { Input } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';
import { StyledWarning } from '.';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const VotingLimit = ({
  value,
  onChange,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const handleDaysLimitOnChange = (value: string) => {
    onChange(parseInt(value, 10));
  };

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.fieldVotingDaysLimit} />
      </SubSectionTitle>
      <StyledWarning>
        <FormattedMessage {...messages.warningTresholdSettings} />
      </StyledWarning>
      <Input
        className="e2e-days-limit"
        name="days_limit"
        type="number"
        min="1"
        required={true}
        value={value.toString()}
        onChange={handleDaysLimitOnChange}
      />
      {isNaN(value) && <Error text={formatMessage(errorMessages.blank)} />}
    </SectionField>
  );
};

export default injectIntl(VotingLimit);
