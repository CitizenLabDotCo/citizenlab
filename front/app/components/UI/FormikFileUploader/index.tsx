import React, { useState } from 'react';
import FileUploader from 'components/UI/FileUploader';
import { FieldProps } from 'formik';
import { UploadFile } from 'typings';
import useRemoteFiles from 'hooks/useRemoteFiles';

interface Props {
  resourceId: string;
  resourceType: string;
}

const FormikFileUploader = ({
  form,
  field,
  resourceId,
  resourceType,
  ...props
}: Props & FieldProps) => {
  const remoteFiles = useRemoteFiles({
    resourceId,
    resourceType,
  });
  const [files, setFiles] = useState<UploadFile[]>([]);
  const handleOnFileAdd = (fileToAdd: UploadFile) => {
    const fileWasAlreadyAdded = remoteFiles
      .map((file) => file.base64)
      .includes(fileToAdd.base64);

    if (!fileWasAlreadyAdded) {
      const newFiles = [...remoteFiles, fileToAdd];
      form.setFieldValue(field.name, newFiles);
      form.setStatus('enabled');
    }
  };

  const handleOnFileRemove = (fileToRemove: UploadFile) => {
    const newFiles = remoteFiles.filter(
      (file) => file.base64 !== fileToRemove.base64
    );
    form.setFieldValue(field.name, newFiles);
  };

  return (
    <FileUploader
      {...props}
      files={files}
      onFileAdd={handleOnFileAdd}
      onFileRemove={handleOnFileRemove}
    />
  );
};

export default FormikFileUploader;
