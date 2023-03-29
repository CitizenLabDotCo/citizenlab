import React, { useState } from 'react';

import { UploadFile } from 'typings';

import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';
import { requestBlob } from 'utils/request';

// components
import FileUploader from 'components/UI/FileUploader';
import { SectionField } from 'components/admin/Section';
import Button from 'components/UI/Button';
import { Box, Text, Title } from '@citizenlab/cl2-component-library';

// resources
import useImportIdeas from '../../api/import_ideas/useImportIdeas';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Import = () => {
  const {
    mutate: addIdeaImportFile,
    isLoading,
    error,
    isSuccess,
    reset,
  } = useImportIdeas();
  const [file, setFile] = useState<UploadFile | undefined>(undefined);

  const handleFileOnAdd = async (fileToAdd: UploadFile) => {
    setFile(fileToAdd);
    reset();
  };

  const handleFileImport = async () => {
    if (!file) return;

    addIdeaImportFile(file.base64);
  };

  const downloadExampleFile = async () => {
    const blob = await requestBlob(
      `${API_PATH}/import_ideas/example_xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  return (
    <>
      <Title>
        <FormattedMessage {...messages.importInputs} />
      </Title>
      <Text color="primary" fontSize="base">
        <FormattedMessage {...messages.importDescription} />
      </Text>
      <SectionField>
        <Text mb="16px" variant="bodyL" fontWeight="bold" color="primary">
          <FormattedMessage {...messages.importStepOne} />
        </Text>
        <Box display="flex" alignItems="flex-start">
          <Button
            buttonStyle="secondary"
            icon="download"
            onClick={downloadExampleFile}
            mb="16px"
          >
            <FormattedMessage {...messages.downloadTemplate} />
          </Button>
        </Box>
        <Text mb="16px" variant="bodyL" fontWeight="bold" color="primary">
          <FormattedMessage {...messages.importStepTwo} />
        </Text>
        <FileUploader
          id={'bulk_idea_import'}
          onFileRemove={() => {
            setFile(undefined);
            reset();
          }}
          onFileAdd={handleFileOnAdd}
          apiErrors={error}
          files={file ? [file] : []}
        />
        <Box display="flex" flexDirection="row" alignItems="flex-start">
          <Button
            buttonStyle="success"
            onClick={handleFileImport}
            processing={isLoading}
          >
            <FormattedMessage {...messages.importInput} />
          </Button>
        </Box>
        {!isLoading && isSuccess && (
          <Text color="success">
            <FormattedMessage {...messages.successMessage} />
          </Text>
        )}
      </SectionField>
    </>
  );
};

export default Import;
