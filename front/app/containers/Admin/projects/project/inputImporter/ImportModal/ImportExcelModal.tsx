import React from 'react';

import {
  Box,
  Button,
  colors,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { UploadFile, SupportedLocale } from 'typings';
import { object, string, mixed } from 'yup';

import { IBackgroundJobData } from 'api/background_jobs/types';
import useAddOfflineIdeasAsync from 'api/import_ideas/useAddOfflineIdeasAsync';
import usePhase from 'api/phases/usePhase';

import useLocale from 'hooks/useLocale';

import Feedback from 'components/HookForm/Feedback';
import SingleFileUploader from 'components/HookForm/SingleFileUploader';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import LocalePicker from './LocalePicker';
import messages from './messages';

interface FormValues {
  locale: SupportedLocale;
  file?: UploadFile;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (jobs: IBackgroundJobData[]) => void;
}

const ImportExcelModal = ({ open, onClose, onImport }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addOfflineIdeas, isLoading } = useAddOfflineIdeasAsync();
  const locale = useLocale();
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);
  const { projectId } = useParams() as {
    projectId: string;
  };

  const downloadFormPath =
    phase?.data.attributes.participation_method === 'native_survey'
      ? `/admin/projects/${projectId}/phases/${phaseId}/survey-form`
      : `/admin/projects/${projectId}/phases/${phaseId}/form`;

  const defaultValues: FormValues = {
    locale,
    file: undefined,
  };

  const schema = object({
    locale: string().required(),
    file: mixed().required(formatMessage(messages.pleaseUploadFile)),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const submitFile = async ({ file, ...rest }: FormValues) => {
    if (!file || !phaseId) return;

    try {
      const response = await addOfflineIdeas({
        phase_id: phaseId,
        file: file.base64,
        format: 'xlsx',
        personal_data: false,
        ...rest,
      });

      onImport(response.data);
      onClose();
      methods.reset();
    } catch (e) {
      handleHookFormSubmissionError(e, methods.setError);
    }
  };

  return (
    <Modal
      width="780px"
      opened={open}
      close={onClose}
      header={
        <Title variant="h2" color="primary" px="24px" m="0">
          <FormattedMessage {...messages.importExcelFileTitle} />
        </Title>
      }
      niceHeader
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(submitFile)}>
          <Box w="100%" p="24px">
            <Feedback onlyShowErrors />
            <Box mb="28px">
              <Text>
                <FormattedMessage
                  {...messages.uploadExcelFile}
                  values={{
                    b: (chunks) => (
                      <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                    ),
                    hereLink: (
                      <Link to={{ pathname: downloadFormPath }}>
                        <FormattedMessage
                          {...messages.templateCanBeDownloadedHere}
                        />
                      </Link>
                    ),
                  }}
                />
              </Text>
            </Box>

            <LocalePicker />

            <Box>
              <SingleFileUploader name="file" accept=".xlsx" />
            </Box>

            <Box w="100%" display="flex" mt="32px">
              <Button
                bgColor={colors.primary}
                width="auto"
                type="submit"
                processing={isLoading}
                disabled={isLoading}
              >
                <FormattedMessage {...messages.upload} />
              </Button>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default ImportExcelModal;
