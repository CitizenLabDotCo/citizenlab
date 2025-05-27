import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  Label,
  Radio,
  colors,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useAddReport from 'api/reports/useAddReport';

import otherModalMessages from 'containers/Admin/reporting/components/ReportBuilderPage/messages';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import { findInitialPhase, PARTICIPATION_METHODS } from './utils';

interface Props {
  projectId: string;
  phaseId: string;
  open: boolean;
  onClose: () => void;
}

interface InnerProps extends Props {
  phases: IPhaseData[];
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

const CreateReportModal = ({
  phases,
  projectId,
  phaseId,
  open,
  onClose,
}: InnerProps) => {
  const { mutate: createReport, isLoading } = useAddReport();
  const [template, setTemplate] = useState<Template>('phase');

  // phaseId refers to the phase that the report will be in (information phase)
  // templatePhaseId refers to the phase that the report will be based on
  // (e.g. survey/ideation phase)
  const [templatePhaseId, setTemplatePhaseId] = useState<string | undefined>(
    findInitialPhase(phases)
  );

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { formatMessage } = useIntl();

  const toggleTemplate = () => {
    setTemplate((template) => (template === 'blank' ? 'phase' : 'blank'));
  };

  const blockSubmit = template === 'phase' && !phaseId;

  const onCreateReport = async () => {
    if (blockSubmit) return;
    setErrorMessage(undefined);

    createReport(
      { phase_id: phaseId },
      {
        onSuccess: (report) => {
          const route = '/admin/reporting/report-builder';
          const path = `${route}/${report.data.id}/editor`;

          const params =
            template === 'phase' && templatePhaseId
              ? `?templatePhaseId=${templatePhaseId}`
              : '';
          const url = `${path}${params}` as RouteType;

          clHistory.push(url);
        },
        onError: () => {
          setErrorMessage(formatMessage(otherModalMessages.anErrorOccurred));
        },
      }
    );
  };

  return (
    <Modal opened={open} close={onClose} width="640px">
      <Box display="flex" flexDirection="column" alignItems="center" px="100px">
        <Title variant="h2" color="primary" mt="40px">
          {formatMessage(otherModalMessages.createReportModalTitle)}
        </Title>
        <Text
          color="primary"
          fontSize="s"
          textAlign="center"
          mt="0px"
          mb="32px"
        >
          {formatMessage(messages.modalDescription)}
        </Text>
        <Box as="fieldset" border="0px" width="100%" p="0px">
          <Label>{formatMessage(otherModalMessages.reportTemplate)}</Label>
          <Radio
            id="blank-template-radio"
            name="blank-template-radio"
            isRequired
            value="blank"
            currentValue={template}
            label={<RadioLabel message={otherModalMessages.blankTemplate} />}
            onChange={toggleTemplate}
          />
          <Radio
            id="project-template-radio"
            name="project-template-radio"
            isRequired
            value="phase"
            currentValue={template}
            label={<RadioLabel message={messages.phaseTemplate} />}
            onChange={toggleTemplate}
          />
        </Box>
        {template === 'phase' && (
          <Box width="100%" mt="12px">
            <PhaseFilter
              label={formatMessage(messages.modalDescription)}
              projectId={projectId}
              phaseId={templatePhaseId}
              participationMethods={PARTICIPATION_METHODS}
              onPhaseFilter={(option) => setTemplatePhaseId(option.value)}
            />
          </Box>
        )}
        {errorMessage && (
          <Box mt="12px">
            <Error text={errorMessage} />
          </Box>
        )}
        <ButtonWithLink
          bgColor={colors.primary}
          width="auto"
          mt="40px"
          mb="40px"
          disabled={blockSubmit || isLoading}
          processing={isLoading}
          data-testid="create-report-button"
          onClick={onCreateReport}
        >
          {formatMessage(otherModalMessages.emptyStateButtonText)}
        </ButtonWithLink>
      </Box>
    </Modal>
  );
};

const CreateReportModalWrapper = ({ projectId, ...otherProps }: Props) => {
  const { data: phases } = usePhases(projectId);
  if (!phases) return null;

  return (
    <CreateReportModal
      phases={phases.data}
      projectId={projectId}
      {...otherProps}
    />
  );
};

export default CreateReportModalWrapper;
