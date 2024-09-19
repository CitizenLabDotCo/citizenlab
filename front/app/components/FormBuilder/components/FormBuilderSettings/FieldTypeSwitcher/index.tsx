import React from 'react';

import { Box, Select, Tooltip } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { getFieldSwitchOptions } from './utils';

type Props = {
  field: IFlatCustomFieldWithIndex;
  surveyHasSubmissions: boolean;
};

const FieldTypeSwitcher = ({ field, surveyHasSubmissions }: Props) => {
  const { formatMessage } = useIntl();
  const { setValue, watch } = useFormContext();

  const inputTypeName = `customFields.${field.index}.input_type`;
  const fieldSwitchOptions = getFieldSwitchOptions(
    watch(inputTypeName),
    formatMessage
  );

  if (fieldSwitchOptions.length === 0) return null;

  return (
    <Box mb="24px">
      <Tooltip
        disabled={!surveyHasSubmissions}
        content={formatMessage(messages.surveyHasSubmissionsWarning)}
      >
        <Select
          disabled={surveyHasSubmissions}
          options={fieldSwitchOptions}
          onChange={(value) => {
            setValue(inputTypeName, value?.value, { shouldDirty: true });
          }}
          value={watch(inputTypeName)}
          label={formatMessage(messages.type)}
        />
      </Tooltip>
    </Box>
  );
};

export default FieldTypeSwitcher;
