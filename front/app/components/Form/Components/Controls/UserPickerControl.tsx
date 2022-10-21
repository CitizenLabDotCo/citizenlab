import {
  Box,
  colors,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { FormLabel } from 'components/UI/FormComponents';
import UserSelect from 'components/UI/UserSelect';
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import messages from '../../messages';
import ErrorDisplay from '../ErrorDisplay';
import controlMessages from './messages';

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
        <Text>{getLabel(uischema, schema, path)}</Text>
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
