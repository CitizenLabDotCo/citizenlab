import React from 'react';

// components
import SingleFileInput from 'components/UI/SingleFileUploader/FileInput';
import FileDisplay from 'components/UI/SingleFileUploader/FileDisplay';
import Error from 'components/UI/Error';

// typings
import { CLErrors, UploadFile } from 'typings';

// style
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import messages from '../../../UI/FileUploader/messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Box } from '@citizenlab/cl2-component-library';

const Container = styled.div`
  width: 100%;
`;

export type AttachmentFile = {
  name: string;
  content: string;
};

export interface FileUploaderProps {
  id: string;
  className?: string;
  onFileAdd: (fileToAdd: AttachmentFile) => void;
  onFileRemove: () => void;
  file: AttachmentFile | null;
  apiErrors?: CLErrors | null;
}

const SingleFileUploader = ({
  onFileAdd,
  onFileRemove,
  file,
  apiErrors,
  id,
  className,
}: FileUploaderProps) => {
  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    onFileAdd({ content: fileToAdd.base64, name: fileToAdd.filename });
  };

  return (
    <Container className={className} key={id}>
      {!file?.name && (
        <Box mt="0px">
          <SingleFileInput onAdd={handleFileOnAdd} id={id} />
        </Box>
      )}
      <Error fieldName="file" apiErrors={apiErrors?.file} />
      {file && (
        <FileDisplay
          key={file.name}
          onDeleteClick={() => {
            onFileRemove();
          }}
          fileName={file.name}
        />
      )}
      <ScreenReaderOnly aria-live="polite">
        <FormattedMessage
          {...(file ? messages.a11y_filesToBeUploaded : messages.a11y_noFiles)}
          values={{ fileNames: file?.name }}
        />
      </ScreenReaderOnly>
    </Container>
  );
};

export default SingleFileUploader;
