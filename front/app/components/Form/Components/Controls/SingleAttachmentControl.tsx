import React, { useState } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps } from '@jsonforms/core';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from '../ErrorDisplay';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { Box } from '@citizenlab/cl2-component-library';
import SingleFileUploader, {
  AttachmentFile,
} from 'components/Form/Components/SingleFileUploader';
import { getSubtextElement } from './controlUtils';

const SingleAttachementControl = ({
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
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </Box>
  );
};

export default withJsonFormsControlProps(SingleAttachementControl);

export const singleAttachmentControlTester = (uischema) => {
  if (uischema?.options?.input_type === 'file_upload') {
    return 1000;
  }
  return -1;
};
