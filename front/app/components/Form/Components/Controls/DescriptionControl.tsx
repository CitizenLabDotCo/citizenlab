import React, { useState } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import QuillEditor from 'components/UI/QuillEditor';
import { WrappedComponentProps } from 'react-intl';
import ErrorDisplay from '../ErrorDisplay';
import { injectIntl } from 'utils/cl-intl';
import { FormLabel } from 'components/UI/FormComponents';
import {
  getLabel,
  sanitizeForClassname,
  getFieldNameFromPath,
} from 'utils/JSONFormUtils';
import { Box } from '@citizenlab/cl2-component-library';

const DescriptionControl = ({
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
    <Box id="e2e-idea-description-input">
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
    </Box>
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
