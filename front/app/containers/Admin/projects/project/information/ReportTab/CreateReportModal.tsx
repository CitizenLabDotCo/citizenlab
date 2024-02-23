import React, { useState } from 'react';

// components
import Modal from 'components/UI/Modal';
import {
  Box,
  Title,
  Text,
  Input,
  Label,
  Radio,
  colors,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import ProjectFilter from 'components/UI/ProjectFilter';

// utils
import clHistory from 'utils/cl-router/history';

// i18n
import messages from './messages';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import useAddReport from 'api/reports/useAddReport';
interface Props {
  open: boolean;
  onClose: () => void;
}

type Template = 'blank' | 'phase';

interface RadioLabelProps {
  message: MessageDescriptor;
}

const RadioLabel = ({ message }: RadioLabelProps) => (
  <Text mt="0px" mb="0px" variant="bodyS" color="primary">
    <FormattedMessage {...message} />
  </Text>
);

const CreateReportModal = ({ open, onClose }: Props) => {
  const { mutate: createReport, isLoading } = useAddReport();
  const [reportTitle, setReportTitle] = useState('');
  const [template, setTemplate] = useState<Template>('phase');
  const [selectedProject, setSelectedProject] = useState<string | undefined>();

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { formatMessage } = useIntl();
  const reportTitleTooShort = reportTitle.length <= 2;

  const toggleTemplate = () => {
    setTemplate((template) => (template === 'blank' ? 'phase' : 'blank'));
  };

  const onCreateReport = async () => {
    if (blockSubmit) return;
    setErrorMessage(undefined);

    createReport(
      { name: reportTitle },
      {
        onSuccess: (report) => {
          const route = '/admin/reporting/report-builder';
          const path = `${route}/${report.data.id}/editor`;

          clHistory.push(path);
        },
        onError: (e) => {
          setErrorMessage(formatMessage(messages.anErrorOccurred));
        },
      }
    );
  };

  return (
    <Modal opened={open} close={onClose} width="640px">
      <Box display="flex" flexDirection="column" alignItems="center" px="100px">
        <Title variant="h2" color="primary" mt="40px">
          {formatMessage(messages.createReportModalTitle)}
        </Title>
        <Text
          color="primary"
          fontSize="s"
          textAlign="center"
          mt="0px"
          mb="32px"
        >
          {formatMessage(messages.createReportModalDescription)}
        </Text>
        <Input
          className="e2e-create-report-modal-title-input"
          value={reportTitle}
          type="text"
          label={formatMessage(messages.createReportModalInputLabel)}
          onChange={setReportTitle}
          disabled={isLoading}
        />
        <Box as="fieldset" border="0px" width="100%" p="0px" mt="28px">
          <Label>{formatMessage(messages.reportTemplate)}</Label>
          <Radio
            id="blank-template-radio"
            name="blank-template-radio"
            isRequired
            value="blank"
            currentValue={template}
            label={<RadioLabel message={messages.blankTemplate} />}
            onChange={toggleTemplate}
          />
          <Radio
            id="project-template-radio"
            name="project-template-radio"
            isRequired
            value="project"
            currentValue={template}
            label={<RadioLabel message={messages.projectTemplate} />}
            onChange={toggleTemplate}
          />
        </Box>
        {template === 'project' && (
          <Box width="100%" mt="12px">
            <ProjectFilter
              projectId={selectedProject}
              emptyOptionMessage={messages.noProjectSelected}
              onProjectFilter={handleProjectFilter}
            />
          </Box>
        )}
        {errorMessage && (
          <Box mt="12px">
            <Error text={errorMessage} />
          </Box>
        )}
        <Button
          bgColor={colors.primary}
          width="auto"
          mt="40px"
          mb="40px"
          disabled={blockSubmit || isLoading}
          processing={isLoading}
          data-testid="create-report-button"
          onClick={onCreateReport}
        >
          {formatMessage(messages.emptyStateButtonText)}
        </Button>
      </Box>
    </Modal>
  );
};

export default CreateReportModal;
