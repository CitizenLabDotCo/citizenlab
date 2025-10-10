import React, { useState } from 'react';

import { Box, Title, Text, Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import CommonGroundInputManager from 'components/admin/PostManager/CommonGroundInputManager';
import ImportInputsModal from 'components/admin/PostManager/CommonGroundInputManager/ImportInputsModal';
import InputManager, {
  TFilterMenu,
} from 'components/admin/PostManager/InputManager';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import AnalysisBanner from '../../components/AnalysisBanner';
import NewIdeaButton from '../../components/NewIdeaButton';
import messages from '../messages';

import ownMessages from './messages';

const defaultTimelineProjectVisibleFilterMenu = 'phases';
const timelineProjectVisibleFilterMenus: TFilterMenu[] = [
  defaultTimelineProjectVisibleFilterMenu,
  'statuses',
  'topics',
];

const AdminProjectIdeas = () => {
  const { projectId, phaseId } = useParams();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: phase } = usePhase(phaseId);
  const [showPastInputsModal, setShowPastInputsModal] = useState(false);
  const isCommonGround =
    phase?.data.attributes.participation_method === 'common_ground';

  if (
    project === undefined ||
    projectId === undefined ||
    phaseId === undefined
  ) {
    return null;
  }

  return (
    <>
      <AnalysisBanner projectId={projectId} phaseId={phaseId} scope="project" />
      <Box mb="30px">
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Title variant="h3" color="primary" my="0px">
            <FormattedMessage {...messages.titleInputManager} />
          </Title>
          <Box display="flex" gap="8px">
            {!isCommonGround && (
              <ButtonWithLink
                width="auto"
                linkTo={`/admin/projects/${projectId}/phases/${phaseId}/input-importer`}
                icon="page"
                buttonStyle="secondary-outlined"
              >
                <FormattedMessage {...ownMessages.importInputs} />
              </ButtonWithLink>
            )}
            {isCommonGround && (
              <Button
                buttonStyle="secondary-outlined"
                onClick={() => setShowPastInputsModal(true)}
              >
                <FormattedMessage {...ownMessages.importInputs} />
              </Button>
            )}
            {phase && (
              <NewIdeaButton
                participationMethod={phase.data.attributes.participation_method}
                inputTerm={phase.data.attributes.input_term}
                linkTo={`/projects/${project.data.attributes.slug}/ideas/new?phase_id=${phaseId}`}
              />
            )}
          </Box>
        </Box>
        {!isCommonGround && (
          <Text color="textSecondary">
            <FormattedMessage {...messages.subtitleInputManager} />
          </Text>
        )}
        <Box display="flex">
          {phase?.data.attributes.participation_method === 'voting' &&
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            (phase?.data.attributes.autoshare_results_enabled ? (
              <Warning>
                <Text color="teal700" m="0px" mr="4px">
                  <FormattedMessage {...messages.votingShareResultsTurnedOn} />
                </Text>
              </Warning>
            ) : (
              <Warning>
                <Box display="flex">
                  <Text fontWeight="bold" color="teal700" m="0px" mr="4px">
                    <FormattedMessage
                      {...messages.votingShareResultsTurnedOff}
                    />
                  </Text>
                  <Text color="teal700" m="0px">
                    <FormattedMessage
                      {...messages.votingShareResultsTurnedOff2}
                    />
                  </Text>
                </Box>
              </Warning>
            ))}
        </Box>
      </Box>
      {isCommonGround ? (
        <>
          <CommonGroundInputManager
            projectId={projectId}
            phaseId={phaseId}
            setShowPastInputsModal={setShowPastInputsModal}
          />

          <ImportInputsModal
            showPastInputsModal={showPastInputsModal}
            setShowPastInputsModal={setShowPastInputsModal}
            currentPhaseid={phaseId}
          />
        </>
      ) : (
        <InputManager
          key={phaseId}
          projectId={projectId}
          phases={phases?.data}
          phaseId={phaseId}
          visibleFilterMenus={timelineProjectVisibleFilterMenus}
          defaultFilterMenu={defaultTimelineProjectVisibleFilterMenu}
        />
      )}
    </>
  );
};

export default AdminProjectIdeas;
