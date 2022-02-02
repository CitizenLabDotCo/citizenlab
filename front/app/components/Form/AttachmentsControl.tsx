import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { FormLabelStyled } from 'components/UI/FormComponents';
import FileUploader from 'components/UI/FileUploader';
import { UploadFile } from 'typings';
import ErrorDisplay from './ErrorDisplay';

const AttachmentsControl = (props: ControlProps) => {
  const { uischema, data, handleChange, path, errors } = props;

  const [files, setFiles] = useState<UploadFile[]>([]);

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    const oldData = data ?? [];
    handleChange(path, [
      ...oldData,
      { file: fileToAdd.base64, name: fileToAdd.filename },
    ]);
    setFiles((files) => [...files, fileToAdd]);
  };
  const handleFileOnRemove = (fileToRemove: UploadFile) => {
    handleChange(
      path,
      data.filter((file) => file.file !== fileToRemove.base64)
    );
    setFiles((files) =>
      files.filter((file) => file.base64 !== fileToRemove.base64)
    );
  };

  return (
    <Box id="e2e-idea-image-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{uischema.label}</FormLabelStyled>
      <FileUploader
        id="idea-form-file-uploader"
        onFileAdd={handleFileOnAdd}
        onFileRemove={handleFileOnRemove}
        files={files}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </Box>
  );
};

export default withJsonFormsControlProps(AttachmentsControl);

export const attachmentsControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('files_attributes')
);
