import React, { useState } from 'react';

// services
import { createReport } from 'services/reports';

// components
import Modal from 'components/UI/Modal';
import {
  Box,
  Title,
  Text,
  Input,
  Label,
  Radio,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import ProjectFilter from 'containers/Admin/dashboard/components/filters/ProjectFilter';

// styling
import { colors } from 'utils/styleUtils';

// utils
import clHistory from 'utils/cl-router/history';

// i18n
import messages from './messages';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { IOption } from 'typings';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Template = 'blank' | 'project';

interface RadioLabelProps {
  message: MessageDescriptor;
}

const RadioLabel = ({ message }: RadioLabelProps) => (
  <Text mt="0px" mb="0px" variant="bodyS" color="primary">
    <FormattedMessage {...message} />
  </Text>
);

const CreateReportModal = ({ open, onClose }: Props) => {
  const [reportTitle, setReportTitle] = useState('');
  const [template, setTemplate] = useState<Template>('blank');
  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const reportTitleTooShort = reportTitle.length <= 2;

  const blockSubmit =
    reportTitleTooShort ||
    (template === 'project' ? selectedProject === undefined : false);

  const toggleTemplate = () => {
    setTemplate((template) => (template === 'blank' ? 'project' : 'blank'));
  };

  const handleProjectFilter = (option: IOption) => {
    setSelectedProject(option.value === '' ? undefined : option.value);
  };

  const onCreateReport = async () => {
    if (blockSubmit) return;
    setLoading(true);

    try {
      const report = await createReport(reportTitle);
      setLoading(false);

      const route = '/admin/reporting/report-builder';
      const path = `${route}/${report.data.id}/editor`;
      const params =
        template === 'project' && selectedProject
          ? `?projectId=${selectedProject}`
          : '';

      clHistory.push(path + params);
    } catch {
      // TODO handle error
      setLoading(false);
    }
  };

  return (
    <Modal opened={open} close={onClose} width="640px">
      <Box display="flex" flexDirection="column" alignItems="center" px="100px">
        <Title variant="h2" color="primary" mt="40px">
          <FormattedMessage {...messages.createReportModalTitle} />
        </Title>
        <Text
          color="primary"
          fontSize="s"
          textAlign="center"
          mt="0px"
          mb="32px"
        >
          <FormattedMessage {...messages.createReportModalDescription} />
        </Text>
        <Input
          value={reportTitle}
          type="text"
          label={<FormattedMessage {...messages.createReportModalInputLabel} />}
          onChange={setReportTitle}
          disabled={loading}
        />
        <Box as="fieldset" border="0px" width="100%" p="0px" mt="28px">
          <Label>
            <FormattedMessage {...messages.reportTemplate} />
          </Label>
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
              currentProjectFilter={selectedProject}
              onProjectFilter={handleProjectFilter}
              width="100%"
            />
          </Box>
        )}
        <Button
          bgColor={colors.primary}
          width="auto"
          mt="40px"
          mb="40px"
          disabled={blockSubmit || loading}
          processing={loading}
          data-testid="create-report-button"
          onClick={onCreateReport}
        >
          <FormattedMessage {...messages.emptyStateButtonText} />
        </Button>
      </Box>
    </Modal>
  );
};

export default CreateReportModal;
