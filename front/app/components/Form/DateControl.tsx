import React, { useState } from 'react';
import moment from 'moment';

import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, DateInput } from 'cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  isDateControl,
} from '@jsonforms/core';
import { FormLabelStyled } from 'components/UI/FormComponents';
import ErrorDisplay from './ErrorDisplay';
import { InjectedIntlProps } from 'react-intl';
import { getLabel } from 'utils/JSONFormUtils';

const DateControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  schema,
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  // todo customize error

  return (
    <Box id="e2e-idea-date-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{getLabel(uischema, schema, path)}</FormLabelStyled>
      <DateInput
        value={data ? moment(data, 'YYYY-MM-DD') : null}
        onChange={(value) => {
          handleChange(path, value ? value.format('YYYY-MM-DD') : null);
          setDidBlur(true);
        }}
      />
      <ErrorDisplay ajvErrors={didBlur ? errors : undefined} fieldPath={path} />
    </Box>
  );
};

export default withJsonFormsControlProps(DateControl);

export const dateControlTester: RankedTester = rankWith(4, isDateControl);
