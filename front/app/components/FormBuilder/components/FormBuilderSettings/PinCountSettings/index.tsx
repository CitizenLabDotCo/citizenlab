import React from 'react';

import { Box, IconTooltip, Label } from '@citizenlab/cl2-component-library';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';

import Input from 'components/HookForm/Input';
import Toggle from 'components/HookForm/Toggle';

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
  selectCountToggleName: string;
};

const PinCountSettings = ({
  minimumSelectCountName,
  maximumSelectCountName,
  selectCountToggleName,
}: Props) => {
  const { formatMessage } = useIntl();
  const isPinLimitEnabled = useWatch({ name: selectCountToggleName });
  const minimumPins = useWatch({ name: minimumSelectCountName });

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <Box mb="24px">
      <Box mb="16px" data-cy="e2e-pin-count-toggle">
        <Toggle
          name={selectCountToggleName}
          label={
            <Box display="flex">
              {formatMessage(messages.limitNumberPins)}
              <Box pl="4px">
                <IconTooltip
                  placement="top-start"
                  content={formatMessage(messages.limitNumberPinsTooltip)}
                />
              </Box>
            </Box>
          }
        />
      </Box>

      {isPinLimitEnabled && (
        <Box ml="16px" data-cy="e2e-pin-count-fields">
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
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PinCountSettings;
