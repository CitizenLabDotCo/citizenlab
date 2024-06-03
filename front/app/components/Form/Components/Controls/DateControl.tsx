import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  isDateControl,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import moment from 'moment';

import DateSinglePicker from 'components/admin/DateSinglePicker';
import { FormLabel } from 'components/UI/FormComponents';

import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getSubtextElement } from './controlUtils';

const DateControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  visible,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  if (!visible) {
    return null;
  }

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <Box display="flex">
        <DateSinglePicker
          id={sanitizeForClassname(id)}
          selectedDate={data ? new Date(data) : null}
          onChange={(value) => {
            handleChange(
              path,
              value ? moment(value).format('YYYY-MM-DD') : null
            );
            setDidBlur(true);
          }}
          disabled={uischema?.options?.readonly}
        />
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay
        inputId={id}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </>
  );
};

export default withJsonFormsControlProps(DateControl);

export const dateControlTester: RankedTester = rankWith(4, isDateControl);
