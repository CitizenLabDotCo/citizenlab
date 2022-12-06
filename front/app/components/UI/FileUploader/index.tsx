import React from 'react';
// style
import styled from 'styled-components';
// typings
import { CLError, UploadFile } from 'typings';
import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import Error from 'components/UI/Error';
import FileDisplay from './FileDisplay';
// components
import FileInput from './FileInput';
// i18n
import messages from './messages';

const Container = styled.div`
  width: 100%;
`;

export interface FileUploaderProps {
  id: string;
  className?: string;
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileRemove: (fileToRemove: UploadFile) => void;
  files: UploadFile[] | null;
  apiErrors?: { [fieldName: string]: CLError[] } | null;
}

const FileUploader = ({
  onFileAdd,
  onFileRemove,
  files,
  apiErrors,
  id,
  className,
}: FileUploaderProps) => {
  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    if (!files?.find((file) => file.base64 === fileToAdd.base64)) {
      onFileAdd(fileToAdd);
    }
  };

  const handleFileOnRemove =
    (fileToRemove: UploadFile) => (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onFileRemove(fileToRemove);
    };

  const fileNames = files ? files.map((file) => file.filename).join(', ') : '';
  return (
    <Container className={className} key={id}>
      <FileInput onAdd={handleFileOnAdd} id={id} />
      <Error fieldName="file" apiErrors={apiErrors?.file} />

      {files &&
        files.map((file) => (
          <FileDisplay
            key={file.id || file.filename}
            onDeleteClick={handleFileOnRemove(file)}
            file={file}
          />
        ))}
      <ScreenReaderOnly aria-live="polite">
        <FormattedMessage
          {...(files && files.length > 0
            ? messages.a11y_filesToBeUploaded
            : messages.a11y_noFiles)}
          values={{ fileNames }}
        />
      </ScreenReaderOnly>
    </Container>
  );
};

export default FileUploader;
