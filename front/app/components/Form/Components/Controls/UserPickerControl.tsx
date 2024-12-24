import React from 'react';

import { Box, colors, IconTooltip } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { FormLabel } from 'components/UI/FormComponents';
import UserSelect from 'components/UI/UserSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import messages from '../../messages';
import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';
import controlMessages from './messages';

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
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
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
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <UserSelect
        id={id}
        inputId={sanitizeForClassname(id)}
        selectedUserId={data}
        onChange={(userOption) => handleChange(path, userOption?.id)}
        placeholder={formatMessage(messages.userPickerPlaceholder)}
      />
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
      />
    </>
  );
};

export default withJsonFormsControlProps(UserPickerControl);

export const userPickerControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('author_id')
);
