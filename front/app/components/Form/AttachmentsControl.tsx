import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box } from 'cl2-component-library';
import { RankedTester, rankWith, scopeEndsWith } from '@jsonforms/core';
import React from 'react';
import { FormLabelStyled } from 'components/UI/FormComponents';
import FileUploader from 'components/UI/FileUploader';
import { UploadFile } from 'typings';
import ErrorDisplay from './ErrorDisplay';

interface InputControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  errors: string;
  schema: any;
  uischema: any;
}

const AttachmentsControl = (props: InputControlProps) => {
  const { uischema, data, handleChange, path, errors } = props;

  const handleIdeaFileOnAdd = (ideaFileToAdd: UploadFile) => {
    const oldData = data ?? [];
    handleChange(path, [...oldData, ideaFileToAdd]);
  };
  const handleIdeaFileOnRemove = (ideaFileToRemove: UploadFile) => {
    handleChange(
      path,
      data.filter(
        (ideaFile: UploadFile) => ideaFile.base64 !== ideaFileToRemove.base64
      )
    );
  };

  return (
    <Box id="e2e-idea-image-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{uischema.label}</FormLabelStyled>
      <FileUploader
        id="idea-form-file-uploader"
        onFileAdd={handleIdeaFileOnAdd}
        onFileRemove={handleIdeaFileOnRemove}
        files={data ?? []}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </Box>
  );
};

export default withJsonFormsControlProps(AttachmentsControl);

export const attachmentsControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('attachments')
);
