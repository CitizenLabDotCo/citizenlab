import React, { useState } from 'react';

// router
import { useParams } from 'react-router-dom';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useProjectById from 'api/projects/useProjectById';

// components
import Modal from 'components/UI/Modal';
import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';
import PhaseSelector from '../PhaseSelector';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// form
import Feedback from 'components/HookForm/Feedback';
import Checkbox from 'components/HookForm/Checkbox';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, boolean, string } from 'yup';
import { handleCLErrorWrapper } from 'utils/errorUtils';

const DEFAULT_VALUES = {
  name: false,
  email: false,
  phase_id: undefined,
} as const;

interface Props {
  open: boolean;
  formType: 'idea_form' | 'survey';
  onClose: () => void;
  onExport: (params: {
    name: boolean;
    email: boolean;
    phase_id?: string;
  }) => Promise<void>;
}

const PDFExportModal = ({ open, formType, onClose, onExport }: Props) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);

  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });
  const [loading, setLoading] = useState(false);

  const isTimelineProject =
    project?.data.attributes.process_type === 'timeline';

  const schema = object({
    name: boolean(),
    email: boolean(),
    phase_id:
      isTimelineProject && formType === 'idea_form'
        ? string().required(formatMessage(messages.selectIdeationPhase))
        : string(),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleExport = async ({
    name,
    email,
    phase_id,
  }: {
    name: boolean;
    email: boolean;
    phase_id?: string;
  }) => {
    setLoading(true);

    try {
      await onExport({ name, email, phase_id });
      setLoading(false);
      onClose();
    } catch (e) {
      setLoading(false);

      handleCLErrorWrapper(e, methods.setError);
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
          <Feedback />
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
                <Text mb="24px">
                  <FormattedMessage {...messages.itIsAlsoPossible} />
                </Text>
                <>
                  <Text mb="24px">
                    <FormattedMessage {...messages.nameAndEmailExplanation} />
                  </Text>
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
              </>
            )}
            {isTimelineProject && formType === 'idea_form' && (
              <Box mb="24px">
                <PhaseSelector
                  label={<FormattedMessage {...messages.phase} />}
                />
              </Box>
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
