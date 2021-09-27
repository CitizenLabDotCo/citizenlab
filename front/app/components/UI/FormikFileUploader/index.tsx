import React, { useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import FileUploader from 'components/UI/FileUploader';
import { FieldProps } from 'formik';
import { UploadFile } from 'typings';
// import useRemoteFiles from 'hooks/useRemoteFiles';
import GetRemoteFiles, {
  TResourceType,
  GetRemoteFilesChildProps,
} from 'resources/GetRemoteFiles';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id?: string;
  resourceId: string | null;
  resourceType: TResourceType;
}

interface DataProps {
  remoteFiles: GetRemoteFilesChildProps;
}

interface Props extends InputProps, DataProps {}

const FormikFileUploader = ({
  form: { setFieldValue, setFieldTouched, setStatus },
  field,
  resourceId,
  resourceType,
  remoteFiles,
  ...props
}: Props & FieldProps) => {
  // const remoteFiles = useRemoteFiles({
  //   resourceId,
  //   resourceType,
  // });
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

    setStatus('enabled');
    setFieldTouched(field.name, true);
  };

  const handleOnFileRemove = (fileToRemove: UploadFile) => {
    if (!isNilOrError(files)) {
      setFiles(files.filter((file) => file.base64 !== fileToRemove.base64));
    }

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

const Data = adopt<DataProps, InputProps>({
  remoteFiles: ({ resourceId, resourceType, render }) => (
    <GetRemoteFiles resourceId={resourceId} resourceType={resourceType}>
      {render}
    </GetRemoteFiles>
  ),
});

export default (inputProps: InputProps & FieldProps) => (
  <Data {...inputProps}>
    {(dataProps) => <FormikFileUploader {...inputProps} {...dataProps} />}
  </Data>
);
