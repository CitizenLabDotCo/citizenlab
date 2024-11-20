import React, { useCallback, useState, KeyboardEvent } from 'react';

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
import { withJsonFormsControlProps } from '@jsonforms/react';

import { getOtherControlKey } from 'components/Form/utils';
import { FormLabel } from 'components/UI/FormComponents';

import { FormattedMessage } from 'utils/cl-intl';
import { isString } from 'utils/helperUtils';
import { sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getSubtextElement } from './controlUtils';
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
  visible,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';

  const onChange = useCallback(
    (value: string) => {
      const stringValue = value === '' ? undefined : value;
      handleChange(
        path,
        schema.type === 'number' && value ? parseFloat(value) : stringValue
      );
    },
    [schema.type, handleChange, path]
  );

  const FieldLabel = () => {
    return (
      <Box display="flex">
        {label}
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
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

  const isOtherField = !!getOtherControlKey(uischema.scope);

  const handleKeyDown = (event: KeyboardEvent) => {
    // We want to prevent the form from being closed when pressing enter
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <>
      {!isOtherField && (
        <Box>
          <FormLabel
            htmlFor={sanitizeForClassname(id)}
            labelValue={<FieldLabel />}
            optional={!required}
            subtextValue={getSubtextElement(uischema.options?.description)}
            subtextSupportsHtml
          />
        </Box>
      )}
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
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          maxCharCount={schema?.maxLength}
          onBlur={() => {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            uischema?.options?.transform === 'trim_on_blur' &&
              isString(data) &&
              onChange(data.trim());
            setDidBlur(true);
          }}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          disabled={uischema?.options?.readonly}
          placeholder={isOtherField ? label : undefined}
          onKeyDown={handleKeyDown}
        />
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </>
  );
};

export default withJsonFormsControlProps(InputControl);

export const inputControlTester: RankedTester = rankWith(3, isControl);
