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
import { UploadFile, SupportedLocale } from 'typings';
import { object, string, mixed } from 'yup';

import { IBackgroundJobData } from 'api/background_jobs/types';
import useAddProjectImportAsync from 'api/project_imports/useAddProjectImportAsync';

import useLocale from 'hooks/useLocale';

import LocalePicker from 'containers/Admin/projects/project/inputImporter/ImportModal/LocalePicker';
import messages from 'containers/Admin/projects/project/inputImporter/ImportModal/messages';

import Feedback from 'components/HookForm/Feedback';
import SingleFileUploader from 'components/HookForm/SingleFileUploader';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';

interface FormValues {
  locale: SupportedLocale;
  file?: UploadFile;
  preview: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (jobs: IBackgroundJobData[]) => void;
}

const ImportZipModal = ({ open, onClose, onImport }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addProjectImport, isLoading } =
    useAddProjectImportAsync();
  const locale = useLocale();

  const defaultValues: FormValues = {
    locale,
    file: undefined,
    preview: false,
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
    if (!file) return;

    try {
      const response = await addProjectImport({
        file: file.base64,
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
          Import projects from zip file
        </Title>
      }
      niceHeader
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(submitFile)}>
          <Box w="100%" p="24px">
            <Feedback onlyShowErrors />
            <Box mb="28px">
              <Text>Zip file should contain xlsx files...</Text>
            </Box>

            <LocalePicker />

            <Box>
              <SingleFileUploader name="file" accept=".zip" />
            </Box>

            <Box mt="24px">
              <CheckboxWithLabel name="preview" label="Preview the import?" />
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

export default ImportZipModal;
