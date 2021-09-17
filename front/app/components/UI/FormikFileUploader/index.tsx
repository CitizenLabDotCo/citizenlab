import React, { useState, useEffect } from 'react';
import FileUploader from 'components/UI/FileUploader';
import { FieldProps } from 'formik';
import { UploadFile } from 'typings';
import useUploadFiles from 'hooks/useUploadFiles';
import { TResourceType } from 'resources/GetResourceFileObjects';
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
  const uploadFiles = useUploadFiles({
    resourceId,
    resourceType,
  });
  const memoizedUploadFiles = React.useMemo(() => uploadFiles, [uploadFiles]);
  const [files, setFiles] = useState<UploadFile[] | null>(null);

  useEffect(() => {
    if (!isNilOrError(memoizedUploadFiles)) {
      setFiles(memoizedUploadFiles);
    }
  }, [memoizedUploadFiles]);

  useEffect(() => {
    form.setFieldValue(field.name, files);
  }, [files, form, field.name]);

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
  };

  const handleOnFileRemove = (fileToRemove: UploadFile) => {
    if (!isNilOrError(files)) {
      setFiles(files.filter((file) => file.base64 !== fileToRemove.base64));
    }

    form.setStatus('enabled');
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
