import React, { useEffect, useState } from 'react';

import {
  Box,
  CollapsibleContainer,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';
import { object, boolean } from 'yup';

import useCustomForm from 'api/custom_form/useCustomForm';
import useUpdateCustomForm from 'api/custom_form/useUpdateCustomForm';
import { IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { FormType } from 'components/FormBuilder/utils';
import Feedback from 'components/HookForm/Feedback';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl, MessageDescriptor } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import { saveIdeaFormAsPDF } from '../../project/inputForm/saveIdeaFormAsPDF';
import { supportsNativeSurvey } from '../../project/inputImporter/ReviewSection/utils';
import { saveSurveyAsPDF } from '../../project/nativeSurvey/saveSurveyAsPDF';

import FormActions from './FormActions';
import messages from './messages';
import MultilocFieldCollapsible from './MultilocFieldCollapsible';
import PersonalDataCheckbox from './PersonalDataCheckbox';

export interface FormPDFExportFormValues {
  print_start_multiloc?: Multiloc;
  print_end_multiloc?: Multiloc;
  personal_data: boolean;
}

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
  const htmlPdfsActive = useFeatureFlag({
    name: 'html_pdfs',
  });

  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const locale = useLocale();
  const { data: customForm } = useCustomForm(phase);
  const { mutateAsync: updateCustomForm } = useUpdateCustomForm(phase);
  const phaseId = phase.id;

  const schema = object({
    personal_data: boolean(),
    ...(htmlPdfsActive && {
      print_start_multiloc: object(),
      print_end_multiloc: object(),
    }),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: {
      ...(htmlPdfsActive && {
        print_start_multiloc: {},
        print_end_multiloc: {},
      }),
      personal_data: false,
    },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (htmlPdfsActive && customForm) {
      methods.reset({
        print_start_multiloc: customForm.data.attributes.print_start_multiloc,
        print_end_multiloc: customForm.data.attributes.print_end_multiloc,
      });
    }
  }, [customForm, htmlPdfsActive, methods]);

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
      if (htmlPdfsActive) {
        await updateCustomForm({
          printStartMultiloc: formValues.print_start_multiloc,
          printEndMultiloc: formValues.print_end_multiloc,
        });
      }
      await onExport(formValues);
      setLoading(false);
      onClose();
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
      // This is necessary to prevent the modal from closing when you e.g. select text in
      // the textarea and happen to arrive outside of the modal with your cursor.
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
            {htmlPdfsActive && (
              <Box mb="24px">
                <MultilocFieldCollapsible
                  title={formatMessage(
                    messages.collapsibleInstructionsStartTitle
                  )}
                  name="print_start_multiloc"
                  label={formatMessage(messages.customiseStart)}
                />

                <MultilocFieldCollapsible
                  title={formatMessage(
                    messages.collapsibleInstructionsEndTitle
                  )}
                  name="print_end_multiloc"
                  label={formatMessage(messages.customiseEnd)}
                  mb="0"
                />
              </Box>
            )}
            <PersonalDataCheckbox />
            <FormActions loading={loading} />
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};

type Props = {
  phaseId: string;
  open: boolean;
  formType: FormType;
  onClose: () => void;
};

export default (props: Props) => {
  const { data: phase } = usePhase(props.phaseId);

  if (!phase) {
    return null;
  }

  return <PDFExportModal phase={phase.data} {...props} />;
};
