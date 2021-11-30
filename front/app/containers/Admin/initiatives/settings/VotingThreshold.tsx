import React from 'react';

// components
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { Input } from 'cl2-component-library';
import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';
import { FieldProps, StyledWarning } from '.';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

const VotingThreshold = ({
  formValues,
  setParentState,
  intl: { formatMessage },
}: FieldProps & InjectedIntlProps) => {
  const handleVotingTresholdOnChange = (value: string) => {
    setParentState(({ formValues }) => ({
      formValues: {
        ...formValues,
        voting_threshold: parseInt(value, 10),
      },
    }));
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
        value={formValues.voting_threshold.toString()}
        onChange={handleVotingTresholdOnChange}
      />

      {isNaN(formValues.voting_threshold) && (
        <Error text={formatMessage(errorMessages.blank)} />
      )}

      {!isNaN(formValues.voting_threshold) &&
        formValues.voting_threshold < 2 && (
          <Error
            text={formatMessage(
              messages.initiativeSettingsVotingThresholdError
            )}
          />
        )}
    </SectionField>
  );
};

export default injectIntl(VotingThreshold);
