import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  Box,
  colors,
  IconTooltip,
  Input,
  Text,
} from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  isControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useCallback, useState } from 'react';
import ErrorDisplay from '../ErrorDisplay';
import { FormLabel } from 'components/UI/FormComponents';
import { sanitizeForClassname } from 'utils/JSONFormUtils';
import { isString } from 'utils/helperUtils';
import VerificationIcon from '../VerificationIcon';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getSubtextElement } from './controlUtils';

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
  visible,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';

  const onChange = useCallback(
    (value: string) => {
      const stringValue = value === '' ? undefined : value;
      handleChange(
        path,
        schema.type === 'number' && value ? parseInt(value, 10) : stringValue
      );
    },
    [schema.type, handleChange, path]
  );

  const FieldLabel = () => {
    return (
      <Box display="flex">
        {label}
        {uischema?.options?.isAdminField && (
          <IconTooltip
            iconColor={colors.grey800}
            marginLeft="4px"
            icon="shield-checkered"
            content={<FormattedMessage {...messages.adminFieldTooltip} />}
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
      <Box>
        <FormLabel
          htmlFor={sanitizeForClassname(id)}
          labelValue={<FieldLabel />}
          optional={!required}
          subtextValue={getSubtextElement(uischema.options?.description)}
          subtextSupportsHtml
        />
      </Box>
      {answerNotPublic && (
        <Text mb="8px" mt="0px" fontSize="s">
          <FormattedMessage {...messages.notPublic} />
        </Text>
      )}
      <Box display="flex" flexDirection="row">
        <Input
          data-testid="inputControl"
          id={sanitizeForClassname(id)}
          className={`input_field_root_${label}`}
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
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(InputControl);

export const inputControlTester: RankedTester = rankWith(3, isControl);
