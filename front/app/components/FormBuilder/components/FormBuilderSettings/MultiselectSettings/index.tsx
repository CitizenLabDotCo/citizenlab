import React from 'react';

import { Box, IconTooltip, Label } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
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
  selectOptionsName: string;
};

const MultiselectSettings = ({
  minimumSelectCountName,
  maximumSelectCountName,
  selectCountToggleName,
  selectOptionsName,
}: Props) => {
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <Box mb="24px">
      <Box mb="16px">
        <Toggle
          name={selectCountToggleName}
          label={
            <Box display="flex">
              {formatMessage(messages.limitNumberAnswers)}
              <Box pl="4px">
                <IconTooltip
                  placement="top-start"
                  content={formatMessage(messages.limitNumberAnswersTooltip)}
                />
              </Box>
            </Box>
          }
        />
      </Box>

      {watch(selectCountToggleName) && (
        <Box ml="16px">
          <Box mb="8px" display="flex">
            <Box minWidth="100px" my="auto">
              <StyledLabel htmlFor="minimumInput" value="Minimum" />
            </Box>
            <Input
              id="minimumInput"
              name={minimumSelectCountName}
              type="number"
              max={watch(selectOptionsName).length}
              min="0"
              size="small"
              onKeyDown={handleKeyDown}
            />
          </Box>
          <Box display="flex">
            <Box minWidth="100px" my="auto">
              <StyledLabel
                htmlFor="maximumInput"
                value={formatMessage(messages.maximum)}
              />
            </Box>
            <Input
              name={maximumSelectCountName}
              id="maximumInput"
              type="number"
              size="small"
              min={watch(minimumSelectCountName)}
              max={watch(selectOptionsName).length}
              onKeyDown={handleKeyDown}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MultiselectSettings;
