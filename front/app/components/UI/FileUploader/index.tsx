import React from 'react';

// components
import FileInput from './FileInput';
import FileDisplay from './FileDisplay';
import Error from 'components/UI/Error';

// typings
import { CLError, UploadFile } from 'typings';

// style
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
    <Container className={className}>
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
