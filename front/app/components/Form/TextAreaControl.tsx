import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  optionIs,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import TextArea from 'components/UI/TextArea';
import { isString } from 'utils/helperUtils';

const TextAreaControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <TextArea
        onChange={(value) => handleChange(path, value)}
        rows={6}
        value={data}
        id={sanitizeForClassname(id)}
        onBlur={() => {
          uischema?.options?.transform === 'trim_on_blur' &&
            isString(data) &&
            handleChange(path, data.trim());
          setDidBlur(true);
        }}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(TextAreaControl);

export const textAreaControlTester: RankedTester = rankWith(
  4,
  optionIs('textarea', true)
);
