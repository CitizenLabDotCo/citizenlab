import React, { useState } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import QuillEditor from 'components/UI/QuillEditor';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from '../ErrorDisplay';
import { injectIntl } from 'utils/cl-intl';
import { FormLabel } from 'components/UI/FormComponents';
import {
  getLabel,
  sanitizeForClassname,
  getFieldNameFromPath,
} from 'utils/JSONFormUtils';

const DescriptionControl = ({
  data,
  handleChange,
  path,
  errors,
  id,
  uischema,
  schema,
  required,
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
      <QuillEditor
        id={sanitizeForClassname(id)}
        value={data}
        onChange={(value) => handleChange(path, value)}
        withCTAButton
        onBlur={() => setDidBlur(true)}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(DescriptionControl));

export const descriptionControlTester: RankedTester = rankWith(
  1000,
  (uischema) =>
    (uischema as any)?.scope
      ? getFieldNameFromPath((uischema as any)?.scope) === 'body_multiloc'
      : false
);
