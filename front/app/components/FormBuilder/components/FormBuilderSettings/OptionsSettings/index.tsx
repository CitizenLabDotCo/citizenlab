import React from 'react';

import {
  Box,
  IconTooltip,
  Toggle as ToggleComponent,
} from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { LIST_LAYOUT_MAX_OPTIONS } from 'components/CustomFieldsForm/constants';
import Toggle from 'components/HookForm/Toggle';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const inputTypesNoDropdown = ['multiselect_image', 'ranking'];

type Props = {
  inputType: string;
  randomizeName: string;
  dropdownLayoutName: string;
  selectOptionsName: string;
};

const OptionsSettings = ({
  inputType,
  randomizeName,
  dropdownLayoutName,
  selectOptionsName,
}: Props) => {
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();

  const optionCount = watch(selectOptionsName)?.length ?? 0;
  // Only single select renders long lists as a dropdown regardless of this
  // setting, so it is the only type where the setting is not the admin's.
  const dropdownForced =
    inputType === 'select' && optionCount > LIST_LAYOUT_MAX_OPTIONS;

  const dropdownLabel = (
    <Box display="flex">
      {formatMessage(messages.displayAsDropdown)}
      <Box pl="4px">
        <IconTooltip
          placement="top-start"
          content={formatMessage(messages.displayAsDropdownTooltip)}
        />
      </Box>
    </Box>
  );

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
          {dropdownForced ? (
            <>
              {/* The stored value is ignored above the threshold, so a
                  form-bound toggle would misreport how the question renders. */}
              <ToggleComponent
                id={dropdownLayoutName}
                checked
                disabled
                label={dropdownLabel}
                onChange={() => {}}
              />
              <Box mt="8px">
                <Warning>
                  {formatMessage(messages.displayAsDropdownForcedWarning, {
                    count: LIST_LAYOUT_MAX_OPTIONS,
                  })}
                </Warning>
              </Box>
            </>
          ) : (
            <Toggle name={dropdownLayoutName} label={dropdownLabel} />
          )}
        </Box>
      )}
    </>
  );
};

export default OptionsSettings;
