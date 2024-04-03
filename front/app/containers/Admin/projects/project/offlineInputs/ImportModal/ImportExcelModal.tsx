import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { UploadFile, SupportedLocale } from 'typings';
import { object, string, mixed } from 'yup';

import useAddOfflineIdeas from 'api/import_ideas/useAddOfflineIdeas';

import useLocale from 'hooks/useLocale';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import ImportModalTemplate from './ImportModalTemplate';
import messages from './messages';

interface FormValues {
  locale: SupportedLocale;
  file?: UploadFile;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const ImportPdfModal = ({ open, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addOfflineIdeas, isLoading } = useAddOfflineIdeas();
  const locale = useLocale();
  const { phaseId } = useParams();

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
      await addOfflineIdeas({
        phase_id: phaseId,
        pdf: file.base64,
        personal_data: false,
        ...rest,
      });

      onClose();
      methods.reset();
    } catch (e) {
      handleHookFormSubmissionError(e, methods.setError);
    }
  };

  return (
    <ImportModalTemplate
      open={open}
      onClose={onClose}
      formMethods={methods}
      submitFile={submitFile}
      message={messages.uploadExcelFile}
      inputs={
        <>
          <Box w="100%" display="flex" mt="32px">
            <Button width="auto" type="submit" processing={isLoading}>
              <FormattedMessage {...messages.upload} />
            </Button>
          </Box>
        </>
      }
    />
  );
};

export default ImportPdfModal;
