import React, { useState } from 'react';

import {
  Box,
  Button,
  CollapsibleContainer,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { useTheme } from 'styled-components';
import { object, boolean } from 'yup';

import { FormType } from 'components/FormBuilder/utils';
import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import Feedback from 'components/HookForm/Feedback';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl, MessageDescriptor } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from './messages';

export interface FormPDFExportFormValues {
  personal_data: boolean;
}

const DEFAULT_VALUES = {
  personal_data: false,
} satisfies FormPDFExportFormValues;

interface Props {
  open: boolean;
  formType: FormType;
  onClose: () => void;
  onExport: (params: FormPDFExportFormValues) => Promise<void>;
}

const CLICK_EXPORT_MESSAGES: { [key in FormType]: MessageDescriptor } = {
  input_form: messages.clickExportToPDFIdeaForm,
  survey: messages.clickExportToPDFSurvey,
};

const IT_IS_POSSIBLE_MESSAGES: { [key in FormType]: MessageDescriptor } = {
  input_form: messages.itIsAlsoPossibleIdeation,
  survey: messages.itIsAlsoPossibleSurvey,
};

const PDFExportModal = ({ open, formType, onClose, onExport }: Props) => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const schema = object({
    personal_data: boolean(),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleExport = async (formValues: FormPDFExportFormValues) => {
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
        <Title variant="h2" as="h1" color="primary" m="0" px="24px">
          <FormattedMessage {...messages.exportAsPDF} />
        </Title>
      }
      niceHeader
    >
      <Box p="24px">
        <CollapsibleContainer
          mb="24px"
          title={formatMessage(messages.notes)}
          titleVariant="h4"
          titleAs="h2"
          titleFontWeight="bold"
          titlePadding="16px"
          border={`1px solid ${theme.colors.grey300}`}
          borderRadius={theme.borderRadius}
          isOpenByDefault
        >
          <Box
            as="ul"
            // pt is less than pb because we have some "illusion" of padding coming from the title component
            pt="12px"
            pb="24px"
            px="36px"
            m="0"
          >
            <Text as="li">
              <FormattedMessage {...CLICK_EXPORT_MESSAGES[formType]} />
            </Text>
            {formType === 'survey' && (
              <Text as="li">
                <FormattedMessage {...messages.logicNotInPDF} />
              </Text>
            )}
            <Text as="li" mb="0">
              <FormattedMessage {...IT_IS_POSSIBLE_MESSAGES[formType]} />
            </Text>
          </Box>
        </CollapsibleContainer>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleExport)}>
            <Feedback onlyShowErrors />
            <CheckboxWithLabel
              name="personal_data"
              label={
                <Text as="span" m="0">
                  <FormattedMessage {...messages.askPersonalData2} />
                </Text>
              }
              labelTooltipText={
                <FormattedMessage {...messages.personalDataExplanation4} />
              }
              mb="24px"
            />
            <Box display="flex">
              <Button type="submit" processing={loading}>
                <FormattedMessage {...messages.exportAsPDF} />
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};

export default PDFExportModal;
