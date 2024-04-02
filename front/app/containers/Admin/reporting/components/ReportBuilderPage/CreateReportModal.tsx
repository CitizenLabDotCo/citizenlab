import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  Input,
  Label,
  Radio,
  colors,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import { IOption } from 'typings';

import useAddReport from 'api/reports/useAddReport';

import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import ProjectFilter from 'components/UI/ProjectFilter';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

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

const reportTitleIsTaken = (error: any) => {
  return error?.errors?.name?.[0]?.error === 'taken';
};

const CreateReportModal = ({ open, onClose }: Props) => {
  const { mutate: createReport, isLoading } = useAddReport();
  const [reportTitle, setReportTitle] = useState('');
  const [template, setTemplate] = useState<Template>('blank');
  const [selectedProject, setSelectedProject] = useState<string | undefined>();

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { formatMessage } = useIntl();
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
    setErrorMessage(undefined);

    createReport(
      { name: reportTitle },
      {
        onSuccess: (report) => {
          const route = '/admin/reporting/report-builder';
          const path = `${route}/${report.data.id}/editor`;
          const params =
            template === 'project' && selectedProject
              ? `?templateProjectId=${selectedProject}`
              : '';
          const url = `${path}${params}` as RouteType;

          clHistory.push(url);
        },
        onError: (e) => {
          if (reportTitleIsTaken(e)) {
            setErrorMessage(formatMessage(messages.reportTitleAlreadyExists));
          } else {
            setErrorMessage(formatMessage(messages.anErrorOccurred));
          }
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
          {formatMessage(messages.customizeReport)}
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
