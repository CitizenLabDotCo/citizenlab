import React, { useState, useEffect } from 'react';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useURLQuery from 'utils/cl-router/useUrlQuery';

// styling
import rocket from 'assets/img/rocket.png';

// components
import { Box, Title, Image } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getMethodConfig, getPhase } from 'utils/participationMethodUtils';
import { getCurrentPhase } from 'services/phases';

// typings
import { ParticipationMethod } from 'services/participationContexts';

interface Props {
  projectId: string;
}

const _Modal = ({ projectId }: Props) => {
  const project = useProject({ projectId });
  const phases = usePhases(projectId);

  const queryParams = useURLQuery();
  const showModalParam = queryParams.get('show_modal');
  const phaseIdParam = queryParams.get('phase_id');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [phaseIdUrl, setPhaseIdUrl] = useState<string | null>(null);

  const ready =
    !isNilOrError(project) &&
    (project.attributes.process_type === 'continuous'
      ? true
      : isNilOrError(phases));

  useEffect(() => {
    if (!ready) return;

    let timer: NodeJS.Timeout;
    if (showModalParam) {
      // TODO: Handle animation when modal is open by default in Modal component
      timer = setTimeout(() => {
        setShowModal(true);
      }, 1500);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [ready, showModalParam]);

  // useEffect to handle modal state and phase parameters
  useEffect(() => {
    if (!ready) return;

    if (phaseIdParam) {
      setPhaseIdUrl(phaseIdParam);
    }

    // Clear URL parameters for continuous projects
    // (handled elsewhere for timeline projects)
    if (project.attributes.process_type === 'continuous') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [ready, project, phaseIdParam]);

  if (!ready) return null;

  let phaseParticipationMethod: ParticipationMethod | undefined;

  if (!isNilOrError(phases)) {
    const phaseInUrl = phaseIdUrl ? getPhase(phaseIdUrl, phases) : null;
    if (phaseInUrl) {
      phaseParticipationMethod = phaseInUrl.attributes.participation_method;
    } else {
      phaseParticipationMethod =
        getCurrentPhase(phases)?.attributes.participation_method;
    }
  }

  const participationMethod =
    phaseParticipationMethod ??
    (project.attributes.participation_method as
      | ParticipationMethod
      | undefined);
  if (!participationMethod) return null;

  const config = getMethodConfig(participationMethod);

  const handleClose = () => setShowModal(false);

  return (
    <Modal opened={showModal} close={handleClose} hasSkipButton={false}>
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Image width="80px" height="80px" src={rocket} alt="" />
        <Title variant="h2" textAlign="center">
          {config.getModalContent({})}
        </Title>
      </Box>
    </Modal>
  );
};

export default _Modal;
