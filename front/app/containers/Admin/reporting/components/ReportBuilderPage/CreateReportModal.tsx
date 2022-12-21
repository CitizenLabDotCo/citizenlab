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

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { IOption } from 'typings';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Template = 'blank' | 'project';

const CreateReportModal = ({ open, onClose }: Props) => {
  const [reportTitle, setReportTitle] = useState('');
  const [template, setTemplate] = useState<Template>('blank');
  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const reportTitleTooShort = reportTitle.length <= 2;

  const toggleTemplate = () => {
    setTemplate((template) => (template === 'blank' ? 'project' : 'blank'));
  };

  const handleProjectFilter = (option: IOption) => {
    setSelectedProject(option.value === '' ? undefined : option.value);
  };

  const onCreateReport = async () => {
    if (reportTitleTooShort) return;
    setLoading(true);

    try {
      await createReport(reportTitle);
      setLoading(false);
      onClose();
    } catch {
      // TODO handle error
      setLoading(false);
    }
  };

  return (
    <Modal opened={open} close={onClose} width="640px">
      <Box display="flex" flexDirection="column" alignItems="center" px="100px">
        <Title variant="h2" color="primary" mt="52px">
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
          <Label>Report template</Label>
          <Radio
            id="blank-template-radio"
            name="blank-template-radio"
            isRequired
            value="blank"
            currentValue={template}
            label={'Blank'}
            onChange={toggleTemplate}
          />
          <Radio
            id="project-template-radio"
            name="project-template-radio"
            isRequired
            value="project"
            currentValue={template}
            label={'Project'}
            onChange={toggleTemplate}
          />
        </Box>
        {template === 'project' && (
          <Box width="100%" mt="28px">
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
          disabled={reportTitleTooShort || loading}
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
