import React, { useState } from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { object, boolean } from 'yup';

import useFeatureFlag from 'hooks/useFeatureFlag';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import Feedback from 'components/HookForm/Feedback';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from './messages';

export interface FormValues {
  personal_data: boolean;
}

const DEFAULT_VALUES = {
  personal_data: false,
} satisfies FormValues;

interface Props {
  open: boolean;
  formType: 'idea_form' | 'survey';
  onClose: () => void;
  onExport: (params: FormValues) => Promise<void>;
}

const CLICK_EXPORT_MESSAGES = {
  idea_form: messages.clickExportToPDFIdeaForm,
  survey: messages.clickExportToPDFSurvey,
} as const;

const IT_IS_POSSIBLE_MESSAGES = {
  idea_form: messages.itIsAlsoPossibleIdeation,
  survey: messages.itIsAlsoPossibleSurvey,
};

const PDFExportModal = ({ open, formType, onClose, onExport }: Props) => {
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });
  const [loading, setLoading] = useState(false);

  const schema = object({
    personal_data: boolean(),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleExport = async (formValues: FormValues) => {
    setLoading(true);

    try {
      await onExport(formValues);
      setLoading(false);
      onClose();
      methods.reset();
    } catch (e) {
      setLoading(false);

      handleHookFormSubmissionError(e, methods.setError);
    }
  };

  return (
    <Modal
      width="580px"
      opened={open}
      close={onClose}
      header={
        <Title variant="h2" color="primary" m="0" px="24px">
          <FormattedMessage {...messages.exportAsPDF} />
        </Title>
      }
      niceHeader
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleExport)}>
          <Feedback onlyShowErrors />
          <Box p="24px" w="100%">
            <Title variant="h3" m="0" mb="24px">
              <FormattedMessage {...messages.notes} />
            </Title>
            <Box as="ul" pl="28px">
              <Text as="li" mb="4px" mt="0px" w="500px">
                <FormattedMessage {...CLICK_EXPORT_MESSAGES[formType]} />
              </Text>
              {formType === 'survey' && (
                <Text as="li" mb="4px" mt="0px" w="500px">
                  <FormattedMessage {...messages.logicNotInPDF} />
                </Text>
              )}
              <Text as="li" mb="4px">
                <FormattedMessage {...IT_IS_POSSIBLE_MESSAGES[formType]} />
                {importPrintedFormsEnabled || (
                  <>
                    {' '}
                    <FormattedMessage {...messages.notIncludedInYourPlan} />
                  </>
                )}
              </Text>
              {importPrintedFormsEnabled ? (
                <>
                  <Text as="li" mb="24px">
                    <FormattedMessage {...messages.personalDataExplanation} />
                  </Text>
                  <Box mb="24px" ml="-20px">
                    <CheckboxWithLabel
                      name="personal_data"
                      label={
                        <Text m="0">
                          <FormattedMessage {...messages.askPersonalData} />
                        </Text>
                      }
                    />
                  </Box>
                </>
              ) : (
                <Box mb="24px" />
              )}
            </Box>
            <Box w="100%" display="flex">
              <Button width="auto" type="submit" processing={loading}>
                <FormattedMessage {...messages.exportAsPDF} />
              </Button>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default PDFExportModal;
