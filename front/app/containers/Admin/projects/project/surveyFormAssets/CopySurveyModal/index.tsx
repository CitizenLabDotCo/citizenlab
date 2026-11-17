import React, { useState } from 'react';

import {
  Text,
  Box,
  Button,
  Label,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import usePhases from 'api/phases/usePhases';

import ProjectFilter from 'containers/Admin/reporting/components/ReportBuilder/Widgets/_shared/ProjectFilter';

import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

type Props = {
  showCopySurveyModal: boolean;
  setShowCopySurveyModal: (show: boolean) => void;
  editFormLink: string;
  surveyFormPersisted: boolean;
  surveyFormLoading?: boolean;
  variant?: 'bo';
};

const CopySurveyModal = ({
  showCopySurveyModal,
  setShowCopySurveyModal,
  editFormLink,
  surveyFormPersisted,
  surveyFormLoading = false,
  variant,
}: Props) => {
  const { formatMessage } = useIntl();

  const [projectId, setProjectId] = useState<string>();
  const [phaseId, setPhaseId] = useState<string>();

  const {
    data: phases,
    isFetching,
    isPlaceholderData,
  } = usePhases(projectId, 'all');
  const canDuplicate =
    !surveyFormLoading &&
    !isFetching &&
    !isPlaceholderData &&
    phases?.data.some(
      (phase) =>
        phase.id === phaseId &&
        phase.relationships.project.data.id === projectId &&
        phase.attributes.participation_method === 'native_survey'
    );

  const close = () => {
    setProjectId(undefined);
    setPhaseId(undefined);
    setShowCopySurveyModal(false);
  };

  const handleProjectFilter = ({ value }: { value: string | undefined }) => {
    setProjectId(value);
    setPhaseId(undefined);
  };

  const handlePhaseFilter = ({ value }: IOption) => {
    setPhaseId(value);
  };

  return (
    <Modal
      width={520}
      opened={showCopySurveyModal}
      close={close}
      header={formatMessage(messages.copySurveyTitle)}
    >
      <Box m="24px" data-cy="e2e-copy-survey-modal">
        {surveyFormLoading && <Spinner />}
        {!surveyFormLoading && surveyFormPersisted && (
          <Warning>
            <Text color="primary" m="0px" fontSize="s">
              {formatMessage(messages.surveyFormPersistedWarning)}
            </Text>
          </Warning>
        )}
        <Text mb="10px" variant="bodyS" color="textSecondary">
          {formatMessage(messages.copySurveyDescription)}
        </Text>
        <Box py="5px" mt="0px" alignItems="center">
          {variant === 'bo' && <Label>{formatMessage(messages.project)}</Label>}
          <ProjectFilter
            projectId={projectId}
            participationMethods={
              variant === 'bo' ? ['native_survey'] : undefined
            }
            placeholder={
              variant === 'bo'
                ? formatMessage(messages.selectSurveyProject)
                : undefined
            }
            emptyOptionMessage={messages.noProject}
            onProjectFilter={handleProjectFilter}
          />
          {projectId !== undefined && (
            <PhaseFilter
              label={formatMessage(messages.survey)}
              projectId={projectId}
              phaseId={phaseId}
              participationMethods={['native_survey']}
              placementType="all"
              onPhaseFilter={handlePhaseFilter}
            />
          )}
        </Box>

        <Box mt="40px" display="flex" justifyContent="space-between">
          <Button p="0px" m="0px" buttonStyle="text" onClick={close}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            disabled={!canDuplicate}
            onClick={() => {
              if (!canDuplicate) return;

              const url = `${editFormLink}?copy_from=${phaseId}`;
              close();
              clHistory.push(url);
            }}
            data-cy="e2e-copy-survey-modal-duplicate"
          >
            {formatMessage(messages.duplicate)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CopySurveyModal;
