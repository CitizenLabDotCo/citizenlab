import React, { useState, useEffect } from 'react';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';

// router
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// styling
import rocket from 'assets/img/rocket.png';

// components
import { Box, Title, Image } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// utils
import { getMethodConfig, getPhase } from 'utils/participationMethodUtils';
import { getCurrentPhase } from 'api/phases/utils';
import { isReady } from './utils';

// typings
import { ParticipationMethod } from 'services/participationContexts';

interface Props {
  projectId: string;
}

const SuccessModal = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const [queryParams] = useSearchParams();
  const [showModalParam] = useState<boolean>(!!queryParams.get('show_modal'));
  const [phaseIdParam] = useState<string | null>(queryParams.get('phase_id'));

  const [showModal, setShowModal] = useState<boolean>(false);

  const ready = isReady(project?.data, phases);

  useEffect(() => {
    if (showModalParam) {
      setTimeout(() => {
        setShowModal(true);
      }, 1500);
    }

    removeSearchParams(['show_modal', 'phase_id']);
  }, [showModalParam]);

  if (!ready) return null;

  let phaseParticipationMethod: ParticipationMethod | undefined;

  if (phases) {
    const phaseInUrl = phaseIdParam
      ? getPhase(phaseIdParam, phases.data)
      : null;
    if (phaseInUrl) {
      phaseParticipationMethod = phaseInUrl.attributes.participation_method;
    } else {
      phaseParticipationMethod = getCurrentPhase(phases.data)?.attributes
        .participation_method;
    }
  }

  const participationMethod =
    phaseParticipationMethod ??
    (project?.data.attributes.participation_method as
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

export default SuccessModal;
