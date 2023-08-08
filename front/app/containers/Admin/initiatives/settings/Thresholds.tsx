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
  numberOfVotesThreshold: number | undefined;
  onChangeNumberOfVotesThreshold: (value: number | undefined) => void;
  numberOfDaysThreshold: number | undefined;
  onChangeNumberOfDaysThreshold: (value: number | undefined) => void;
}

const Thresholds = ({
  numberOfVotesThreshold,
  onChangeNumberOfVotesThreshold,
  numberOfDaysThreshold,
  onChangeNumberOfDaysThreshold,
}: Props) => {
  const { formatMessage } = useIntl();
  const [numberOfVotesThresholdChanged, setNumberOfVotesThresholdChanged] =
    useState(false);
  const [numberOfDaysThresholdChanged, setNumberOfDaysThresholdChanged] =
    useState(false);

  const handleDaysLimitOnChange = (numberOfDaysStr: string) => {
    // parseInt on empty string results in NaN
    const numberOfDays = isNaN(parseInt(numberOfDaysStr, 10))
      ? undefined
      : parseInt(numberOfDaysStr, 10);

    onChangeNumberOfDaysThreshold(numberOfDays);
    setNumberOfDaysThresholdChanged(true);
  };

  const handleReactingTresholdOnChange = (numberOfVotesStr: string) => {
    // parseInt on empty string results in NaN
    const numberOfVotes = isNaN(parseInt(numberOfVotesStr, 10))
      ? undefined
      : parseInt(numberOfVotesStr, 10);

    onChangeNumberOfVotesThreshold(numberOfVotes);
    setNumberOfVotesThresholdChanged(true);
  };

  return (
    <SectionField>
      <SubSectionTitle>{formatMessage(messages.thresholds)}</SubSectionTitle>
      <Box mb="16px">
        <Input
          className="e2e-reacting-threshold"
          name="reacting_threshold"
          type="number"
          min="2"
          required={true}
          value={
            numberOfVotesThreshold ? numberOfVotesThreshold.toString() : null
          }
          onChange={handleReactingTresholdOnChange}
          label={formatMessage(messages.numberOfVotesThreshold)}
        />
        {numberOfVotesThresholdChanged && (
          <StyledWarning>
            {formatMessage(messages.warningTresholdSettings)}
          </StyledWarning>
        )}

        {typeof numberOfVotesThreshold !== 'number' && (
          <Error text={formatMessage(errorMessages.blank)} />
        )}

        {typeof numberOfVotesThreshold === 'number' &&
          numberOfVotesThreshold < 2 && (
            <Error
              text={formatMessage(
                messages.initiativeSettingsVotingThresholdError
              )}
            />
          )}
      </Box>
      <>
        <Input
          className="e2e-days-limit"
          name="days_limit"
          type="number"
          min="1"
          required
          value={
            numberOfDaysThreshold ? numberOfDaysThreshold.toString() : null
          }
          onChange={handleDaysLimitOnChange}
          label={formatMessage(messages.numberOfDaysThreshold)}
        />
        {numberOfDaysThresholdChanged && (
          <StyledWarning>
            {formatMessage(messages.warningTresholdSettings)}
          </StyledWarning>
        )}
        {typeof numberOfDaysThreshold !== 'number' && (
          <Error text={formatMessage(errorMessages.blank)} />
        )}
      </>
    </SectionField>
  );
};

export default Thresholds;
