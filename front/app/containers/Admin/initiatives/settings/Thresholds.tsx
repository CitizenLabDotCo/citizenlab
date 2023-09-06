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
  numberOfVotesThreshold: number;
  onChangeNumberOfVotesThreshold: (value: number) => void;
  numberOfDaysThreshold: number;
  onChangeNumberOfDaysThreshold: (value: number) => void;
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
    onChangeNumberOfDaysThreshold(parseInt(numberOfDaysStr, 10));
    setNumberOfDaysThresholdChanged(true);
  };

  const handleReactingTresholdOnChange = (numberOfVotesStr: string) => {
    onChangeNumberOfVotesThreshold(parseInt(numberOfVotesStr, 10));
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
          required
          value={numberOfVotesThreshold.toString()}
          onChange={handleReactingTresholdOnChange}
          label={formatMessage(messages.numberOfVotesThreshold)}
        />
        {numberOfVotesThresholdChanged && (
          <StyledWarning>
            {formatMessage(messages.warningTresholdSettings)}
          </StyledWarning>
        )}
        {Number.isNaN(numberOfVotesThreshold) && (
          <Error text={formatMessage(errorMessages.blank)} />
        )}
        {numberOfVotesThreshold < 2 && (
          <Error text={formatMessage(messages.initiativeMinimumVotesError)} />
        )}
      </Box>
      <>
        <Input
          className="e2e-days-limit"
          name="days_limit"
          type="number"
          min="1"
          required
          value={numberOfDaysThreshold.toString()}
          onChange={handleDaysLimitOnChange}
          label={formatMessage(messages.numberOfDaysThreshold)}
        />
        {numberOfDaysThresholdChanged && (
          <StyledWarning>
            {formatMessage(messages.warningTresholdSettings)}
          </StyledWarning>
        )}
        {Number.isNaN(numberOfDaysThreshold) && (
          <Error text={formatMessage(errorMessages.blank)} />
        )}
        {numberOfDaysThreshold < 1 && (
          <Error text={formatMessage(messages.initiativeMinimumDaysError)} />
        )}
      </>
    </SectionField>
  );
};

export default Thresholds;
