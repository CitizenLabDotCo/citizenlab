import React, { useCallback, useState } from 'react';

// intl

// components
import { Text, Box, Button } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import { IOption } from 'typings';

import ProjectFilter from 'containers/Admin/reporting/components/ReportBuilder/Widgets/_shared/ProjectFilter';

import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';
import Warning from 'components/UI/Warning';

// routing
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

type Props = {
  showCopySurveyModal: boolean;
  setShowCopySurveyModal: (show: boolean) => void;
  editFormLink: RouteType;
  surveyFormPersisted: boolean;
};

const CopySurveyModal = ({
  showCopySurveyModal,
  setShowCopySurveyModal,
  editFormLink,
  surveyFormPersisted,
}: Props) => {
  const { formatMessage } = useIntl();

  const [projectId, setProjectId] = useState();
  const [phaseId, setPhaseId] = useState();

  // TODO: Very similar to what happens in report builder - could we combine?
  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setProjectId(value);
    },
    [setProjectId]
  );

  const handlePhaseFilter = useCallback(
    ({ value }: IOption) => {
      setPhaseId(value);
    },
    [setPhaseId]
  );

  return (
    <Modal
      width={520}
      opened={showCopySurveyModal}
      close={() => {
        setShowCopySurveyModal(false);
      }}
      header={formatMessage(messages.copySurveyTitle)}
    >
      <Box m="24px" data-cy="e2e-copy-survey-modal">
        {surveyFormPersisted && (
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
          <ProjectFilter
            projectId={projectId}
            emptyOptionMessage={messages.noProject}
            onProjectFilter={handleProjectFilter}
          />
          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {projectId !== undefined && (
            <PhaseFilter
              label={formatMessage(messages.surveyPhase)}
              projectId={projectId}
              phaseId={phaseId}
              participationMethods={['native_survey']}
              onPhaseFilter={handlePhaseFilter}
            />
          )}
        </Box>

        <Box mt="40px" display="flex" justifyContent="space-between">
          <Button
            p="0px"
            m="0px"
            buttonStyle="text"
            onClick={() => {
              setShowCopySurveyModal(false);
            }}
          >
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            disabled={!phaseId}
            onClick={() => {
              const url = `${editFormLink}?copy_from=${phaseId}` as RouteType;
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
