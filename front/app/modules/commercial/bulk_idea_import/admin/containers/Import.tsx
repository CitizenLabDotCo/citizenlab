import React, { useState } from 'react';

// components
import FileUploader from 'components/UI/FileUploader';
import { SectionField } from 'components/admin/Section';
import Button from 'components/UI/Button';
import {
  Box,
  Text,
  Title,
  colors,
  Error,
} from '@citizenlab/cl2-component-library';

// hooks
import useImportIdeas from '../../api/import_ideas/useImportIdeas';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';
import { requestBlob } from 'utils/request';
import { isCLErrorsWrapper } from 'utils/errorUtils';

// typings
import { CLErrorsWrapper, UploadFile } from 'typings';

const Import = () => {
  const { formatMessage } = useIntl();
  const {
    mutateAsync: addIdeaImportFile,
    isLoading,
    error,
    isSuccess,
    reset,
  } = useImportIdeas();
  const [ideasTakingLong, setIdeasTakingLong] = useState(false);
  const [unknownError, setUnknownError] = useState(false);
  const [file, setFile] = useState<UploadFile | undefined>(undefined);

  const resetMessagesShownToUser = () => {
    setIdeasTakingLong(false);
    setUnknownError(false);
  };

  const handleFileOnAdd = async (fileToAdd: UploadFile) => {
    resetMessagesShownToUser();
    setFile(fileToAdd);
    reset();
  };

  const handleFileImport = async () => {
    resetMessagesShownToUser();
    if (!file) return;

    try {
      await addIdeaImportFile(file.base64);
    } catch (e) {
      if (e?.message === 'Gateway timeout') {
        setIdeasTakingLong(true);
        return;
      }

      if (isCLErrorsWrapper(e)) {
        // this will be handled by the error returned
        // by the hook
        return;
      }

      setUnknownError(true);
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
    <Box background={colors.white} p="40px">
      <Title color="primary">
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
          apiErrors={
            error ? (error as unknown as CLErrorsWrapper).errors : null
          }
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
        {isLoading && !ideasTakingLong && (
          <Text color="textSecondary">
            <FormattedMessage {...messages.ideasBeingImported} />
          </Text>
        )}
        {!isLoading && isSuccess && (
          <Text color="success">
            <FormattedMessage {...messages.successMessage} />
          </Text>
        )}
        {ideasTakingLong && (
          <Text color="textSecondary">
            <FormattedMessage {...messages.importTakingLonger} />
          </Text>
        )}
        {unknownError && (
          <Error text={formatMessage(messages.somethingWentWrong)} />
        )}
      </SectionField>
    </Box>
  );
};

export default Import;
