import {
  ControlProps,
  optionIs,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { FormLabel } from 'components/UI/FormComponents';
import QuillEditor from 'components/UI/QuillEditor';
import React, { useState } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import ErrorDisplay from '../ErrorDisplay';

const WYSIWYGControl = ({
  data,
  handleChange,
  path,
  errors,
  id,
  uischema,
  schema,
  required,
}: ControlProps & WrappedComponentProps) => {
  const [didBlur, setDidBlur] = useState(false);

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
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

export default withJsonFormsControlProps(injectIntl(WYSIWYGControl));

export const WYSIWYGControlTester: RankedTester = rankWith(
  10,
  optionIs('render', 'WYSIWYG')
);
