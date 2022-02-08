import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, IconTooltip, Input } from 'cl2-component-library';
import {
  ControlProps,
  isControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useCallback, useState } from 'react';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { FormLabel } from 'components/UI/FormComponents';
import { sanitizeForClassname } from 'utils/JSONFormUtils';
import { isString } from 'utils/helperUtils';
import messages from './messages';

export const InputControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
  label,
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  const onChange = useCallback(
    (value: string) =>
      handleChange(
        path,
        schema.type === 'number' && value ? parseInt(value, 10) : value
      ),
    [schema.type, handleChange, path]
  );

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={label}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row">
        <Input
          data-testid="inputControl"
          id={sanitizeForClassname(id)}
          type={schema.type === 'number' ? 'number' : 'text'}
          value={data}
          onChange={onChange}
          maxCharCount={schema?.maxLength}
          onBlur={() => {
            uischema?.options?.transform === 'trim_on_blur' &&
              isString(data) &&
              onChange(data.trim());
            setDidBlur(true);
          }}
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
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(InputControl));

export const inputControlTester: RankedTester = rankWith(3, isControl);
