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
};

const TopicsSettings = ({
  minimumSelectCountName,
  maximumSelectCountName,
  selectCountToggleName,
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
      <Box mb="16px" data-cy="e2e-limit-topics-toggle">
        <Toggle
          name={selectCountToggleName}
          label={
            <Box display="flex">
              {formatMessage(messages.limitNumberTags)}
              <Box pl="4px">
                <IconTooltip
                  placement="top-start"
                  content={formatMessage(messages.limitNumberTagsTooltip)}
                />
              </Box>
            </Box>
          }
        />
      </Box>

      {watch(selectCountToggleName) && (
        <Box ml="16px">
          <Box mb="8px" display="flex" data-cy="e2e-limit-topics-minimum">
            <Box minWidth="100px" my="auto">
              <StyledLabel
                htmlFor="minimumInput"
                value={formatMessage(messages.minimum)}
              />
            </Box>
            <Input
              id="minimumInput"
              name={minimumSelectCountName}
              type="number"
              min="0"
              size="small"
              onKeyDown={handleKeyDown}
            />
          </Box>
          <Box display="flex" data-cy="e2e-limit-topics-maximum">
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
              onKeyDown={handleKeyDown}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TopicsSettings;
