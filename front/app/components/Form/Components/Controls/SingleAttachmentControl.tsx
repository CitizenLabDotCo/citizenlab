import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import SingleFileUploader, {
  AttachmentFile,
} from 'components/Form/Components/SingleFileUploader';
import { FormLabel } from 'components/UI/FormComponents';

import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';

const SingleAttachmentControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  required,
  id,
  schema,
  visible,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  const handleFileOnAdd = async (fileToAdd: AttachmentFile) => {
    handleChange(path, {
      name: fileToAdd.name,
      content: fileToAdd.content,
    });
    setDidBlur(true);
  };
  const handleFileOnRemove = () => {
    handleChange(path, undefined);
    setDidBlur(true);
  };

  if (!visible) {
    return null;
  }

  return (
    <Box id="e2e-idea-file-upload">
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <SingleFileUploader
        id={sanitizeForClassname(id)}
        onFileAdd={handleFileOnAdd}
        onFileRemove={handleFileOnRemove}
        file={data}
      />
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </Box>
  );
};

export default withJsonFormsControlProps(SingleAttachmentControl);

export const singleAttachmentControlTester = (uischema) => {
  if (uischema?.options?.input_type === 'file_upload') {
    return 1000;
  }
  return -1;
};
