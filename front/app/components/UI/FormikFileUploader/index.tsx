import React, { useState, useEffect } from 'react';
import FileUploader from 'components/UI/FileUploader';
import { FieldProps } from 'formik';
import { UploadFile } from 'typings';
import useRemoteFiles from 'hooks/useRemoteFiles';
import { TResourceType } from 'resources/GetResourceFileObjects';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  resourceId: string;
  resourceType: TResourceType;
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

  useEffect(() => {
    if (!isNilOrError(remoteFiles)) {
      setFiles(remoteFiles);
    }
  }, [remoteFiles]);

  useEffect(() => {
    form.setFieldValue(field.name, files);
  }, [files]);

  const handleOnFileAdd = (fileToAdd: UploadFile) => {
    const fileWasAlreadyAdded = files
      .map((file) => file.base64)
      .includes(fileToAdd.base64);

    if (!fileWasAlreadyAdded) {
      setFiles([...files, fileToAdd]);
      form.setStatus('enabled');
    } else {
      // show error?
    }
  };

  const handleOnFileRemove = (fileToRemove: UploadFile) => {
    setFiles(files.filter((file) => file.base64 !== fileToRemove.base64));
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
