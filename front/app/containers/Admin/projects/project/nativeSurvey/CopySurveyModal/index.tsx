import React, {useCallback, useState} from 'react';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import {
  Icon,
  Text,
  Box,
  Button,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// routing
import clHistory from 'utils/cl-router/history';
import {IOption} from "typings";
import PhaseFilter from "containers/Admin/reporting/components/ReportBuilder/Widgets/_shared/PhaseFilter";
import ProjectFilter from "containers/Admin/reporting/components/ReportBuilder/Widgets/_shared/ProjectFilter";

type Props = {
  showCopySurveyModal: boolean;
  setShowCopySurveyModal: (show: boolean) => void;
  editFormLink: string;
};

const CopySurveyModal = ({
                            showCopySurveyModal,
                            setShowCopySurveyModal,
                            editFormLink,
                          }: Props) => {
  const { formatMessage } = useIntl();

  const [projectId, setProjectId] = useState();
  const [phaseId, setPhaseId] = useState();

  // TODO: JS - very similar to what happens in report builder - could we combine?
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

  console.log('projectId', projectId);

  return (
    <Modal
      width={520}
      opened={showCopySurveyModal}
      close={() => {
        setShowCopySurveyModal(false);
      }}
      header={formatMessage(messages.copySurveyTitle)}
    >
      <Box m="24px" data-cy="e2e-edit-warning-modal">
        <Text mb="10px" fontSize="s">
          <Icon
            name="info-outline"
            width="16px"
            height="16px"
            mr="4px"
            fill="textSecondary"
            display="inline"
          />
          [message needed here if form has already been saved]
        </Text>
        <Text mb="10px" variant="bodyS" color="textSecondary">{formatMessage(messages.copySurveyDescription)}</Text>
          <Box
            py="4px"
            mt="0px"
            mb="16px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
          <ProjectFilter
            projectId={projectId}
            emptyOptionMessage={messages.noProject}
            onProjectFilter={handleProjectFilter}
          />

          {projectId !== undefined && (
            <PhaseFilter
              label={formatMessage(messages.surveyPhase)}
              projectId={projectId}
              phaseId={phaseId}
              participationMethod="native_survey"
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
            buttonStyle="cl-blue"
            disabled={!phaseId}
            onClick={() => {
              clHistory.push(`${editFormLink}?copy_from=${phaseId}`);
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
