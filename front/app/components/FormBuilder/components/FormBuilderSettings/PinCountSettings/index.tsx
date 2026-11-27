import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';

import Input from 'components/HookForm/Input';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const StyledLabel = styled(Label)`
  height: 100%;
  margin-top: auto;
  margin-bottom: auto;
`;

type Props = {
  minimumSelectCountName: string;
  maximumSelectCountName: string;
};

const PinCountSettings = ({
  minimumSelectCountName,
  maximumSelectCountName,
}: Props) => {
  const { formatMessage } = useIntl();
  const minimumPins = useWatch({ name: minimumSelectCountName });

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <Box mb="24px">
      <Text color="textSecondary" mt="0" mb="8px">
        {formatMessage(messages.numberOfLocations)}
      </Text>
      <Box data-cy="e2e-pin-count-fields">
        <Box mb="8px" display="flex">
          <Box minWidth="100px" my="auto">
            <StyledLabel
              htmlFor="minimumPinsInput"
              value={formatMessage(messages.minimum)}
            />
          </Box>
          <Input
            id="minimumPinsInput"
            name={minimumSelectCountName}
            type="number"
            min="0"
            size="small"
            onKeyDown={handleKeyDown}
            placeholder={formatMessage(messages.noMinimum)}
          />
        </Box>
        <Box display="flex">
          <Box minWidth="100px" my="auto">
            <StyledLabel
              htmlFor="maximumPinsInput"
              value={formatMessage(messages.maximum)}
            />
          </Box>
          <Input
            id="maximumPinsInput"
            name={maximumSelectCountName}
            type="number"
            size="small"
            min={minimumPins}
            onKeyDown={handleKeyDown}
            placeholder={formatMessage(messages.noLimit)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PinCountSettings;
