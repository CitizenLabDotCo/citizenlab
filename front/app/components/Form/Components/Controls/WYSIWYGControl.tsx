import React, { useState } from 'react';

import {
  ControlProps,
  RankedTester,
  rankWith,
  optionIs,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { WrappedComponentProps } from 'react-intl';

import { FormLabel } from 'components/UI/FormComponents';
import QuillEditor from 'components/UI/QuillEditor';

import { injectIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';

const WYSIWYGControl = ({
  data,
  handleChange,
  path,
  errors,
  id,
  uischema,
  schema,
  required,
  visible,
}: ControlProps & WrappedComponentProps) => {
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
      <QuillEditor
        id={sanitizeForClassname(id)}
        value={data}
        onChange={(value) => handleChange(path, value)}
        withCTAButton
        onBlur={() => setDidBlur(true)}
      />
      <ErrorDisplay
        inputId={id}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(WYSIWYGControl));

export const WYSIWYGControlTester: RankedTester = rankWith(
  10,
  optionIs('render', 'WYSIWYG')
);
