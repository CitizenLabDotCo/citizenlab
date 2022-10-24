import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import React from 'react';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
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
  intl: { formatMessage },
  id,
  schema,
  required,
}: ControlProps & WrappedComponentProps) => {
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
        inputId={sanitizeForClassname(id)}
        value={data}
        onChange={(val) => handleChange(path, val)}
        placeholder={formatMessage(messages.userPickerPlaceholder)}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(UserPickerControl));

export const userPickerControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('author_id')
);
