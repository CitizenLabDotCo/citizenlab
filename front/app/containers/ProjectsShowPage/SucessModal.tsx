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
import {
  getMethodConfig,
  getPhase,
} from 'utils/configs/participationMethodConfig';
import { getCurrentParticipationContext } from 'api/phases/utils';
import { isReady } from './utils';

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

  const phaseInUrl =
    phaseIdParam && phases ? getPhase(phaseIdParam, phases.data) : undefined;
  const participationContext =
    phaseInUrl ?? getCurrentParticipationContext(project?.data, phases?.data);
  const participationMethod =
    participationContext?.attributes.participation_method;

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
