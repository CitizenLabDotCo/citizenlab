import React from 'react';

import { Box, Select, Tooltip } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import { generateTempId } from 'components/FormBuilder/utils';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { getFieldSwitchOptions } from './utils';

type Props = {
  field: IFlatCustomFieldWithIndex;
  formHasSubmissions: boolean;
};

const FieldTypeSwitcher = ({ field, formHasSubmissions }: Props) => {
  const { formatMessage } = useIntl();
  const { setValue, watch } = useFormContext();

  const inputTypeName = `customFields.${field.index}.input_type`;
  const fieldSwitchOptions = getFieldSwitchOptions(
    watch(inputTypeName),
    formatMessage
  );

  // Don't show if there are no field switch options, or it's a built-in field
  if (fieldSwitchOptions.length === 0 || field.code) return null;

  return (
    <Box mb="24px">
      <Tooltip
        disabled={!formHasSubmissions}
        content={formatMessage(messages.formHasSubmissionsWarning)}
      >
        <Box>
          <Select
            disabled={formHasSubmissions}
            options={fieldSwitchOptions}
            onChange={(value) => {
              // Remove the current field ID, since we want to create a new field
              setValue(`customFields.${field.index}.id`, undefined, {
                shouldDirty: true,
              });
              // Generate a new temp ID for the field
              setValue(
                `customFields.${field.index}.temp_id`,
                generateTempId(),
                {
                  shouldDirty: true,
                }
              );
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              setValue(inputTypeName, value?.value, { shouldDirty: true });
            }}
            value={watch(inputTypeName)}
            label={formatMessage(messages.type)}
          />
        </Box>
      </Tooltip>
    </Box>
  );
};

export default FieldTypeSwitcher;
