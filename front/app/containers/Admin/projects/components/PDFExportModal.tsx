import React, { useState } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import Modal from 'components/UI/Modal';
import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// form
import Checkbox from 'components/HookForm/Checkbox';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, boolean } from 'yup';
import { isCLErrorsIsh, handleCLErrorsIsh } from 'utils/errorUtils';

const DEFAULT_VALUES = {
  name: false,
  email: false,
} as const;

interface Props {
  open: boolean;
  formType: 'idea_form' | 'survey';
  onClose: () => void;
  onExport: (params: { name: boolean; email: boolean }) => Promise<void>;
}

const PDFExportModal = ({ open, formType, onClose, onExport }: Props) => {
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });
  const [loading, setLoading] = useState(false);

  const schema = object({
    termsAndConditionsAccepted: boolean(),
    privacyPolicyAccepted: boolean(),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleExport = async ({
    name,
    email,
  }: {
    name: boolean;
    email: boolean;
  }) => {
    setLoading(true);

    try {
      await onExport({ name, email });
      setLoading(false);
      onClose();
    } catch (e) {
      setLoading(false);

      if (isCLErrorsIsh(e)) {
        handleCLErrorsIsh(e, methods.setError);
        return;
      }
    }
  };

  return (
    <Modal
      fullScreen={false}
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
          <Box p="24px" w="100%">
            <Text mb="20px" mt="0px" w="500px">
              {formType === 'idea_form' && (
                <FormattedMessage {...messages.clickExportToPDFIdeaForm} />
              )}
              {formType === 'survey' && (
                <FormattedMessage {...messages.clickExportToPDFSurvey} />
              )}
            </Text>
            {formType === 'idea_form' && importPrintedFormsEnabled && (
              <>
                <Text mb="24px">Printed form explanation</Text>
                <Box mb="12px">
                  <Checkbox
                    name="name"
                    label={
                      <Text m="0">
                        <FormattedMessage {...messages.includeFullName} />
                      </Text>
                    }
                  />
                </Box>
                <Box mb="24px">
                  <Checkbox
                    name="email"
                    label={
                      <Text m="0">
                        <FormattedMessage {...messages.includeEmail} />
                      </Text>
                    }
                  />
                </Box>
              </>
            )}
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
