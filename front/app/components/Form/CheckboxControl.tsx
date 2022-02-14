import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, Checkbox, IconTooltip } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isBooleanControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React from 'react';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import messages from './messages';

const CheckboxControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
}: ControlProps & InjectedIntlProps) => {
  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row">
        <Checkbox
          id={sanitizeForClassname(id)}
          checked={Boolean(data)}
          onChange={() => handleChange(path, !data)}
          label={schema.description || null}
          disabled={uischema?.options?.readonly}
        />
        {uischema?.options?.verificationLocked && (
          <IconTooltip
            content={<FormattedMessage {...messages.blockedVerified} />}
            icon="lock"
            marginLeft="5px"
          />
        )}
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={false} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(CheckboxControl));

export const checkboxControlTester: RankedTester = rankWith(
  4,
  isBooleanControl
);
