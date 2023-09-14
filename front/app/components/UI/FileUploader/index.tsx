import React from 'react';

// components
import FileInput from './FileInput';
import FileDisplay, { FileType } from './FileDisplay';
import Error from 'components/UI/Error';

// typings
import { CLErrors, UploadFile } from 'typings';

// style
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  width: 100%;
`;

export interface Props {
  id: string;
  className?: string;
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileRemove?: (fileToRemove: FileType) => void;
  files: FileType[] | null;
  apiErrors?: CLErrors | null;
}

const FileUploader = ({
  onFileAdd,
  onFileRemove,
  files,
  apiErrors,
  id,
  className,
}: Props) => {
  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    if (!files?.find((file) => file.base64 === fileToAdd.base64)) {
      onFileAdd(fileToAdd);
    }
  };

  const handleFileOnRemove =
    (fileToRemove: FileType) => (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onFileRemove?.(fileToRemove);
    };
  const fileNames = files ? files.map((file) => file.name).join(', ') : '';

  return (
    <Container className={className} key={id}>
      <FileInput onAdd={handleFileOnAdd} id={id} />
      <Error fieldName="file" apiErrors={apiErrors?.file} />

      {files &&
        files.map((file) => (
          <FileDisplay
            key={file.id || file.name}
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
