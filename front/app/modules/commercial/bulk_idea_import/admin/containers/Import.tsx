import React, { useState } from 'react';

import { UploadFile, CLErrors } from 'typings';

import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';
import { requestBlob } from 'utils/request';

// components
import FileUploader from 'components/UI/FileUploader';
import { SectionField } from 'components/admin/Section';
import Button from 'components/UI/Button';
import { Box, Text, Title } from '@citizenlab/cl2-component-library';

// resources
import { addIdeaImportFile } from 'services/ideaFiles';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const SectionDescription = styled(Text)`
  font-size: ${fontSizes.base}px;
`;

const Import = () => {
  const [file, setFile] = useState<UploadFile | undefined>(undefined);
  const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileOnAdd = async (fileToAdd: UploadFile) => {
    setFile(fileToAdd);
    setApiErrors(undefined);
  };

  const handleFileImport = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      await addIdeaImportFile(file.base64);
      setIsSuccess(true);
      setApiErrors(undefined);
    } catch (errors) {
      setIsSuccess(false);
      setApiErrors(errors?.json);
    } finally {
      setIsLoading(false);
    }
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
      <SectionDescription>
        <Text color="adminTextColor">
          <FormattedMessage {...messages.importDescription} />
        </Text>
      </SectionDescription>
      <SectionField>
        <Text
          mb="16px"
          variant="bodyL"
          fontWeight="bold"
          color="adminTextColor"
        >
          <FormattedMessage {...messages.importStepOne} />
        </Text>
        <SectionDescription>
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
          <Text>
            <FormattedMessage {...messages.importHint} />
          </Text>
        </SectionDescription>

        <Text
          mb="16px"
          variant="bodyL"
          fontWeight="bold"
          color="adminTextColor"
        >
          <FormattedMessage {...messages.importStepTwo} />
        </Text>
        <FileUploader
          id={'bulk_idea_import'}
          onFileRemove={() => {
            setFile(undefined);
            setApiErrors(undefined);
          }}
          onFileAdd={handleFileOnAdd}
          apiErrors={apiErrors}
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
          <Text color="clGreenSuccess">
            <FormattedMessage {...messages.successMessage} />
          </Text>
        )}
      </SectionField>
    </>
  );
};

export default Import;
