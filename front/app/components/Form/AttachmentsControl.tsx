import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { FormLabel } from 'components/UI/FormComponents';
import FileUploader from 'components/UI/FileUploader';
import { UploadFile } from 'typings';
import ErrorDisplay from './ErrorDisplay';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

const AttachmentsControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  required,
  id,
  schema,
}: ControlProps) => {
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
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <FileUploader
        id={sanitizeForClassname(id)}
        onFileAdd={handleFileOnAdd}
        onFileRemove={handleFileOnRemove}
        files={files}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(AttachmentsControl);

export const attachmentsControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('files_attributes')
);
