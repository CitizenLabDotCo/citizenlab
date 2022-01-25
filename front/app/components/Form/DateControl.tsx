import React, { useState } from 'react';
import moment from 'moment';

import { withJsonFormsControlProps } from '@jsonforms/react';
import { DateInput } from 'cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  isDateControl,
} from '@jsonforms/core';
import { FormLabel } from 'components/UI/FormComponents';
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
  id,
  required,
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  // todo customize error

  return (
    <>
      <FormLabel
        htmlFor={id}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <DateInput
        id={id}
        value={data ? moment(data, 'YYYY-MM-DD') : null}
        onChange={(value) => {
          handleChange(path, value ? value.format('YYYY-MM-DD') : null);
          setDidBlur(true);
        }}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(DateControl);

export const dateControlTester: RankedTester = rankWith(4, isDateControl);
