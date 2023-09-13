import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SingleFileInput from 'components/UI/SingleFileUploader/FileInput';
import FileDisplay from 'components/UI/SingleFileUploader/FileDisplay';
// import Error from 'components/UI/Error';

// style
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'components/UI/FileUploader/messages';

// typings
import { UploadFile } from 'typings';

export interface Props {
  file: UploadFile | null;
}

const SingleFileUploader = ({ file }: Props) => {
  return (
    <Box w="100%">
      {!file?.filename && (
        <Box mt="0px">
          <SingleFileInput id="" onAdd={handleFileOnAdd} />
        </Box>
      )}
      {/* <Error fieldName="file" apiErrors={apiErrors?.file} /> */}
      {file && (
        <FileDisplay
          key={file.name}
          onDeleteClick={() => {
            onFileRemove();
          }}
          fileName={file.filename}
        />
      )}
      <ScreenReaderOnly aria-live="polite">
        <FormattedMessage
          {...(file ? messages.a11y_filesToBeUploaded : messages.a11y_noFiles)}
          values={{ fileNames: file?.name }}
        />
      </ScreenReaderOnly>
    </Box>
  );
};

export default SingleFileUploader;
