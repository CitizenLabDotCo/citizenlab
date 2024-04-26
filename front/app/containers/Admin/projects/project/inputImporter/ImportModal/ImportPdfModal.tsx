import React from 'react';

import {
  Box,
  Text,
  Title,
  Button,
  TooltipContentWrapper,
  Icon,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import Tippy from '@tippyjs/react';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { UploadFile, SupportedLocale } from 'typings';
import { object, string, mixed, boolean } from 'yup';

import { IBackgroundJobData } from 'api/background_jobs/types';
import useAddOfflineIdeasAsync from 'api/import_ideas/useAddOfflineIdeasAsync';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import Checkbox from 'components/HookForm/Checkbox';
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
  personal_data: boolean;
  google_consent: false;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (jobs: IBackgroundJobData[]) => void;
}

const ImportPdfModal = ({ open, onClose, onImport }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addOfflineIdeas, isLoading } = useAddOfflineIdeasAsync();
  const locale = useLocale();
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);
  const { projectId } = useParams() as {
    projectId: string;
  };
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });

  const downloadFormPath =
    phase?.data.attributes.participation_method === 'native_survey'
      ? `/admin/projects/${projectId}/phases/${phaseId}/native-survey`
      : `/admin/projects/${projectId}/phases/${phaseId}/ideaform`;

  const defaultValues: FormValues = {
    locale,
    file: undefined,
    personal_data: false,
    google_consent: false,
  };

  const schema = object({
    locale: string().required(),
    file: mixed().required(formatMessage(messages.pleaseUploadFile)),

    personal_data: boolean(),
    google_consent: boolean().test(
      '',
      formatMessage(messages.consentNeeded),
      (v, context) => {
        if (context.parent.file?.extension === 'application/pdf') {
          return !!v;
        }

        return true;
      }
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const submitFile = async ({
    file,
    google_consent: _,
    ...rest
  }: FormValues) => {
    if (!file || !phaseId) return;

    try {
      const response = await addOfflineIdeas({
        phase_id: phaseId,
        file: file.base64,
        format: 'pdf',
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
      fullScreen={false}
      width="780px"
      opened={open}
      close={onClose}
      header={
        <Title variant="h2" color="primary" px="24px" m="0">
          <FormattedMessage {...messages.importPDFFileTitle} />
        </Title>
      }
      niceHeader
    >
      {/* inspired by front/app/containers/Admin/projects/project/ideas/AnalysisBanner.tsx */}
      {importPrintedFormsEnabled || (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderRadius={stylingConsts.borderRadius}
          mx="24px"
          mb="-8px"
          px="8px"
          bgColor={colors.errorLight}
        >
          <Box display="flex" alignItems="center">
            <Icon
              name="lock"
              width="50px"
              height="50px"
              mr="8px"
              fill={colors.textPrimary}
            />
            <Text>{formatMessage(messages.disabledPDFImportTooltip)}</Text>
          </Box>
        </Box>
      )}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(submitFile)}>
          <Box w="100%" p="24px">
            <Feedback onlyShowErrors />
            <Box mb="28px">
              <Text>
                <FormattedMessage
                  {...messages.uploadPdfFile}
                  values={{
                    b: (chunks) => (
                      <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                    ),
                    hereLink: (
                      <Link to={{ pathname: downloadFormPath }}>
                        <FormattedMessage
                          {...messages.formCanBeDownloadedHere}
                        />
                      </Link>
                    ),
                  }}
                />
              </Text>
            </Box>

            <LocalePicker />

            <Box>
              <SingleFileUploader name="file" accept=".pdf" />
            </Box>

            <Box mt="24px">
              <Checkbox
                name="personal_data"
                label={<FormattedMessage {...messages.formHasPersonalData} />}
              />
            </Box>
            <Box mt="24px">
              <Checkbox
                name="google_consent"
                label={<FormattedMessage {...messages.googleConsent} />}
              />
            </Box>
            <Box w="100%" display="flex" mt="32px">
              <Tippy
                interactive={true}
                theme={''}
                maxWidth={350}
                disabled={importPrintedFormsEnabled}
                content={
                  <TooltipContentWrapper tippytheme="light">
                    <FormattedMessage {...messages.disabledPDFImportTooltip} />
                  </TooltipContentWrapper>
                }
              >
                <Box>
                  <Button
                    width="auto"
                    type="submit"
                    processing={isLoading}
                    disabled={!importPrintedFormsEnabled}
                  >
                    <FormattedMessage {...messages.upload} />
                  </Button>
                </Box>
              </Tippy>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default ImportPdfModal;
