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
import { useParams } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';
import { object, boolean } from 'yup';

import useUpdateCustomForm from 'api/custom_form/useUpdateCustomForm';
import { IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import useLocale from 'hooks/useLocale';

import { FormType } from 'components/FormBuilder/utils';
import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import Feedback from 'components/HookForm/Feedback';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl, MessageDescriptor } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import { saveIdeaFormAsPDF } from '../../project/inputForm/saveIdeaFormAsPDF';
import { supportsNativeSurvey } from '../../project/inputImporter/ReviewSection/utils';
import { saveSurveyAsPDF } from '../../project/nativeSurvey/saveSurveyAsPDF';

import messages from './messages';

export interface FormPDFExportFormValues {
  print_start_multiloc: Multiloc;
  print_end_multiloc: Multiloc;
  personal_data: boolean;
}

const DEFAULT_VALUES = {
  print_start_multiloc: {},
  print_end_multiloc: {},
  personal_data: false,
} satisfies FormPDFExportFormValues;

const CLICK_EXPORT_MESSAGES: { [key in FormType]: MessageDescriptor } = {
  input_form: messages.clickExportToPDFIdeaForm,
  survey: messages.clickExportToPDFSurvey,
};

const IT_IS_POSSIBLE_MESSAGES: { [key in FormType]: MessageDescriptor } = {
  input_form: messages.itIsAlsoPossibleIdeation,
  survey: messages.itIsAlsoPossibleSurvey,
};

type PDFExportModalProps = Props & {
  phase: IPhaseData;
};

const PDFExportModal = ({
  open,
  formType,
  onClose,
  phase,
}: PDFExportModalProps) => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const locale = useLocale();
  const { mutateAsync: updateCustomForm } = useUpdateCustomForm(phase);
  const phaseId = phase.id;

  const schema = object({
    personal_data: boolean(),
    print_start_multiloc: object(),
    print_end_multiloc: object(),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const onExport = async ({ personal_data }: FormPDFExportFormValues) => {
    if (supportsNativeSurvey(phase.attributes.participation_method)) {
      await saveSurveyAsPDF({
        phaseId,
        locale,
        personal_data,
      });
    } else {
      await saveIdeaFormAsPDF({ phaseId, locale, personal_data });
    }
  };

  const handleExport = async (formValues: FormPDFExportFormValues) => {
    setLoading(true);

    try {
      await updateCustomForm({
        printStartMultiloc: formValues.print_start_multiloc,
        printEndMultiloc: formValues.print_end_multiloc,
      });
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
      closeOnClickOutside={false}
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
            <CollapsibleContainer
              mb="24px"
              // To be configured
              title={'Instructions start'}
              titleVariant="h4"
              titleAs="h2"
              titleFontWeight="bold"
              titlePadding="16px"
              border={`1px solid ${theme.colors.grey300}`}
              borderRadius={theme.borderRadius}
              isOpenByDefault
            >
              <Box p="24px">
                <QuillMultilocWithLocaleSwitcher
                  name="print_start_multiloc"
                  // To be configured
                  label={'Instructions start'}
                  noImages
                  noVideos
                  noLinks
                />
              </Box>
            </CollapsibleContainer>
            <CollapsibleContainer
              mb="24px"
              // To be configured
              title={'Instructions end'}
              titleVariant="h4"
              titleAs="h2"
              titleFontWeight="bold"
              titlePadding="16px"
              border={`1px solid ${theme.colors.grey300}`}
              borderRadius={theme.borderRadius}
              isOpenByDefault
            >
              <Box p="24px">
                <QuillMultilocWithLocaleSwitcher
                  name="print_end_multiloc"
                  // To be configured
                  label={'Instructions end'}
                  noImages
                  noVideos
                  noLinks
                />
              </Box>
            </CollapsibleContainer>
            <CheckboxWithLabel
              name="personal_data"
              label={
                <Text as="span" m="0">
                  <FormattedMessage {...messages.askPersonalData3} />
                </Text>
              }
              labelTooltipText={
                <FormattedMessage {...messages.personalDataExplanation5} />
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

type Props = {
  open: boolean;
  formType: FormType;
  onClose: () => void;
};

export default (props: Props) => {
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);

  if (!phase) {
    return null;
  }

  return <PDFExportModal phase={phase.data} {...props} />;
};
