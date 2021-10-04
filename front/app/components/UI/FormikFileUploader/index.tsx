import React, { useState, useEffect } from 'react';
import FileUploader from 'components/UI/FileUploader';
import { FieldProps } from 'formik';
import { UploadFile } from 'typings';
import useRemoteFiles from 'hooks/useRemoteFiles';
import { TResourceType } from 'resources/GetRemoteFiles';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  id?: string;
  resourceId: string | null;
  resourceType: TResourceType;
}

const FormikFileUploader = ({
  form: { setFieldValue, setFieldTouched, setStatus },
  field,
  resourceId,
  resourceType,
  ...props
}: Props & FieldProps) => {
  const remoteFiles = useRemoteFiles({
    resourceId,
    resourceType,
  });
  const [files, setFiles] = useState<UploadFile[] | null>(null);

  useEffect(() => {
    if (!isNilOrError(remoteFiles)) {
      setFiles(remoteFiles);
    }
  }, [remoteFiles]);

  useEffect(() => {
    setFieldValue(field.name, files);
  }, [files, field.name, setFieldValue]);

  const handleOnFileAdd = (fileToAdd: UploadFile) => {
    handleOnChange();

    if (!isNilOrError(files)) {
      const fileWasAlreadyAdded = files
        .map((file) => file.base64)
        .includes(fileToAdd.base64);

      if (!fileWasAlreadyAdded) {
        setFiles([...files, fileToAdd]);
      } else {
        // show error?
      }
    } else {
      setFiles([fileToAdd]);
    }
  };

  const handleOnFileRemove = (fileToRemove: UploadFile) => {
    handleOnChange();

    if (!isNilOrError(files)) {
      setFiles(files.filter((file) => file.base64 !== fileToRemove.base64));
    }
  };

  const handleOnChange = () => {
    setStatus('enabled');
    setFieldTouched(field.name, true);
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
