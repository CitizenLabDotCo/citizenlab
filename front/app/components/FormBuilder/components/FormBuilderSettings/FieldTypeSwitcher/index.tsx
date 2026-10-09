import React from 'react';

import { Box, Select, Tooltip } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';
import { supportsPublicAnswers } from 'api/custom_fields/util';
import useFormSubmissionsCount from 'api/submission_count/useSubmissionCount';

import { useIntl } from 'utils/cl-intl';
import { generateTempId } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import messages from './messages';
import { getFieldSwitchOptions } from './utils';

type Props = {
  field: IFlatCustomFieldWithIndex;
};

const FieldTypeSwitcher = ({ field }: Props) => {
  const { phaseId } = useParams({ strict: false });

  const { data: submissionCount } = useFormSubmissionsCount({
    phaseId,
  });

  const { formatMessage } = useIntl();
  const { setValue, watch } = useFormContext();

  const inputTypeName = `customFields.${field.index}.input_type`;
  const fieldSwitchOptions = getFieldSwitchOptions(
    watch(inputTypeName),
    formatMessage
  );

  if (
    // Don't show if there are no field switch options, or it's a built-in field
    fieldSwitchOptions.length === 0 ||
    field.code ||
    // We need to know the submission count for this component
    !submissionCount
  ) {
    return null;
  }

  const formHasSubmissions =
    submissionCount.data.attributes.totalSubmissions > 0;

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
              setValue(inputTypeName, value.value, { shouldDirty: true });
              // Only some types can show their answers publicly, and the
              // visibility toggle is hidden for the others. Reset it so the
              // new field does not keep a public value that can't be seen.
              if (!supportsPublicAnswers(value.value)) {
                setValue(
                  `customFields.${field.index}.answers_visible_to`,
                  'moderators',
                  { shouldDirty: true }
                );
              }
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
