import React from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';

import Toggle from 'components/HookForm/Toggle';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  inputType: string;
  randomizeName: string;
  dropdownLayoutName: string;
};

const OptionsSettings = ({
  inputType,
  randomizeName,
  dropdownLayoutName,
}: Props) => {
  const { formatMessage } = useIntl();
  const inputTypesNoDropdown = [
    'multiselect_image',
    'ranking',
    'matrix_linear_scale',
  ];

  return (
    <>
      <Box mb="24px">
        <Toggle
          name={randomizeName}
          label={
            <Box display="flex">
              {formatMessage(messages.randomize)}
              <Box pl="4px">
                <IconTooltip
                  placement="top-start"
                  content={formatMessage(messages.randomizeToolTip)}
                />
              </Box>
            </Box>
          }
        />
      </Box>
      {!inputTypesNoDropdown.includes(inputType) && (
        <Box mb="24px">
          <Toggle
            name={dropdownLayoutName}
            label={
              <Box display="flex">
                {formatMessage(messages.displayAsDropdown)}
                <Box pl="4px">
                  <IconTooltip
                    placement="top-start"
                    content={formatMessage(messages.displayAsDropdownTooltip)}
                  />
                </Box>
              </Box>
            }
          />
        </Box>
      )}
    </>
  );
};

export default OptionsSettings;
