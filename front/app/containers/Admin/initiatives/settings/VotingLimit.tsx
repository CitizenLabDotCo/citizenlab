import React from 'react';

// components
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { Input } from 'cl2-component-library';
import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';
import { StyledWarning, FieldProps } from '.';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

const VotingLimit = ({
  formValues,
  setParentState,
  intl: { formatMessage },
}: FieldProps & InjectedIntlProps) => {
  const handleDaysLimitOnChange = (value: string) => {
    setParentState(({ formValues }) => ({
      formValues: {
        ...formValues,
        days_limit: parseInt(value, 10),
      },
    }));
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
        value={formValues.days_limit.toString()}
        onChange={handleDaysLimitOnChange}
      />
      {isNaN(formValues.days_limit) && (
        <Error text={formatMessage(errorMessages.blank)} />
      )}
    </SectionField>
  );
};

export default injectIntl(VotingLimit);
