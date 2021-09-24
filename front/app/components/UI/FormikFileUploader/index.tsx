import React, { useState, useEffect } from 'react';
import FileUploader from 'components/UI/FileUploader';
import { FieldProps } from 'formik';
import { UploadFile } from 'typings';
import useRemoteFiles from 'hooks/useRemoteFiles';
import { TResourceType } from 'resources/GetRemoteFiles';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  resourceId: string | null;
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
  const [files, setFiles] = useState<UploadFile[] | null>(null);

  useEffect(() => {
    if (!isNilOrError(remoteFiles)) {
      setFiles(remoteFiles);
    }
  }, [remoteFiles]);

  useEffect(() => {
    form.setFieldValue(field.name, files);
  }, [files, field.name, form, form.setFieldValue]);

  const handleOnFileAdd = (fileToAdd: UploadFile) => {
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

    form.setStatus('enabled');
    form.setFieldTouched(field.name, true);
  };

  const handleOnFileRemove = (fileToRemove: UploadFile) => {
    if (!isNilOrError(files)) {
      setFiles(files.filter((file) => file.base64 !== fileToRemove.base64));
    }

    form.setStatus('enabled');
    form.setFieldTouched(field.name, true);
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
