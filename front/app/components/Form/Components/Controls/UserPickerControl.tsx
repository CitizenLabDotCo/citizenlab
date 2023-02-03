import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import React from 'react';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import ErrorDisplay from '../ErrorDisplay';
import UserSelect from 'components/UI/UserSelect';
import messages from '../../messages';
import controlMessages from './messages';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { Box, colors, IconTooltip } from '@citizenlab/cl2-component-library';

const UserPickerControl = ({
  data,
  handleChange,
  path,
  errors,
  uischema,
  id,
  schema,
  required,
  visible,
}: ControlProps) => {
  const { formatMessage } = useIntl();
  const FieldLabel = () => {
    return (
      <Box display="flex">
        {getLabel(uischema, schema, path)}
        {uischema?.options?.isAdminField && (
          <IconTooltip
            iconColor={colors.grey800}
            marginLeft="4px"
            icon="shield-checkered"
            content={
              <FormattedMessage {...controlMessages.adminFieldTooltip} />
            }
          />
        )}
      </Box>
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={<FieldLabel />}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <UserSelect
        id={id}
        inputId={sanitizeForClassname(id)}
        value={data}
        onChange={(val) => handleChange(path, val)}
        placeholder={formatMessage(messages.userPickerPlaceholder)}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(UserPickerControl);

export const userPickerControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('author_id')
);
