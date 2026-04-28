import React, { useEffect } from 'react';

import {
  Box,
  Text,
  Title,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider, Resolver } from 'react-hook-form';
import { SupportedLocale } from 'typings';
import { object, mixed, boolean, number } from 'yup';

import useAddOfflineIdeasAsync from 'api/import_ideas/useAddImportedIdeasAsync';
import usePhase from 'api/phases/usePhase';

import useLocale from 'hooks/useLocale';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import Feedback from 'components/HookForm/Feedback';
import Input from 'components/HookForm/Input';
import SingleFileUploader from 'components/HookForm/SingleFileUploader';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { useParams } from 'utils/router';
import validateLocale from 'utils/yup/validateLocale';

import LocalePicker from './LocalePicker';
import messages from './messages';

interface FormValues {
  locale: SupportedLocale;
  file?: Record<string, any>;
  personal_data: boolean;
  multiple_forms: boolean;
  pages_per_form: number | undefined;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const ImportPdfModal = ({ open, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addOfflineIdeas, isLoading } = useAddOfflineIdeasAsync();
  const locale = useLocale();
  const { projectId, phaseId } = useParams({
    strict: false,
  });
  const { data: phase } = usePhase(phaseId);

  const downloadFormPath =
    phase?.data.attributes.participation_method === 'native_survey'
      ? `/admin/projects/${projectId}/phases/${phaseId}/survey-form`
      : `/admin/projects/${projectId}/phases/${phaseId}/form`;

  const defaultValues = {
    locale,
    file: undefined,
    personal_data: false,
    multiple_forms: false,
    pages_per_form: undefined,
  };

  const schema = object({
    locale: validateLocale().required(),
    file: mixed().required(formatMessage(messages.pleaseUploadFile)),
    personal_data: boolean().required(),
    multiple_forms: boolean().required(),
    pages_per_form: number()
      .transform((value, originalValue) =>
        originalValue === '' || originalValue === undefined ? undefined : value
      )
      .when('multiple_forms', {
        is: true,
        then: (s) => s.required(formatMessage(messages.pagesPerFormRequired)),
      }),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema) as Resolver<FormValues>,
  });

  const file = methods.watch('file');
  const multipleFormsChecked = methods.watch('multiple_forms');

  useEffect(() => {
    // If we uncheck the "multiple forms" checkbox,
    // we want to reset the pages_per_form field
    if (!multipleFormsChecked) {
      methods.setValue('pages_per_form', undefined);
    }
  }, [multipleFormsChecked, methods]);

  const submitFile = async ({
    file,
    locale,
    personal_data,
    multiple_forms,
    pages_per_form,
  }: FormValues) => {
    if (!phaseId) return;

    try {
      await addOfflineIdeas({
        phase_id: phaseId,
        file: file?.base64,
        format: 'pdf',
        locale,
        personal_data,
        pages_per_form: multiple_forms ? pages_per_form : undefined,
      });

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
      close={() => {
        methods.reset();
        onClose();
      }}
      header={
        <Title variant="h2" color="primary" px="24px" m="0">
          <FormattedMessage {...messages.importPDFFileTitle} />
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
              <SingleFileUploader name="file" accept=".pdf" shouldUnregister />
            </Box>

            <Box mt="24px">
              <CheckboxWithLabel
                name="multiple_forms"
                label={<FormattedMessage {...messages.multipleFormsCheckbox} />}
              />
            </Box>
            {multipleFormsChecked && (
              <Box mt="16px">
                <Input
                  name="pages_per_form"
                  type="number"
                  label={formatMessage(messages.pagesPerFormLabel)}
                  min="1"
                  step="1"
                />

                <Text fontSize="s" color="textSecondary" mt="4px">
                  <FormattedMessage {...messages.pagesPerFormDescription} />
                </Text>
              </Box>
            )}

            <Box mt="24px">
              <CheckboxWithLabel
                name="personal_data"
                label={<FormattedMessage {...messages.formHasPersonalData} />}
              />
            </Box>
            <Box w="100%" display="flex" mt="32px">
              <Button
                bgColor={colors.primary}
                width="auto"
                type="submit"
                processing={isLoading}
                disabled={!file?.base64}
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

export default ImportPdfModal;
