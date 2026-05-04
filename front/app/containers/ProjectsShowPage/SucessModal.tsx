import React, { useState, useEffect } from 'react';

import { Box, Image } from '@citizenlab/cl2-component-library';
import rocket from 'assets/img/rocket.png';

import useIdeaById from 'api/ideas/useIdeaById';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import Modal from 'components/UI/Modal';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import {
  getMethodConfig,
  getPhase,
} from 'utils/configs/participationMethodConfig';
import { useSearchTanStack } from 'utils/router';

import { isReady } from './utils';

interface Props {
  projectId: string;
}

const SuccessModal = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const queryParams = useSearchTanStack({ strict: false });
  const showModalParam = queryParams.show_modal !== undefined;
  const phaseIdParam = queryParams.phase_id;
  const [newIdeaIdParam] = useState(queryParams.new_idea_id);
  const { data: idea } = useIdeaById(newIdeaIdParam);

  const [showModal, setShowModal] = useState<boolean>(false);

  const ready = isReady(project?.data, phases);

  useEffect(() => {
    if (showModalParam) {
      setTimeout(() => {
        setShowModal(true);
      }, 1500);
    }

    removeSearchParams(['show_modal', 'phase_id', 'new_idea_id']);
  }, [showModalParam]);

  if (!ready) return null;
  // If there is a newIdeaIdParam, wait for idea to load
  if (newIdeaIdParam && !idea) return null;

  const phaseInUrl =
    phaseIdParam && phases ? getPhase(phaseIdParam, phases.data) : undefined;
  const participationContext = phaseInUrl ?? getCurrentPhase(phases?.data);
  const participationMethod =
    participationContext?.attributes.participation_method;

  if (!participationMethod) return null;

  const config = getMethodConfig(participationMethod);

  const handleClose = () => setShowModal(false);

  return (
    <Modal
      opened={showModal}
      close={handleClose}
      hasSkipButton={false}
      ariaLabelledBy="success-modal-title"
    >
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Image width="80px" height="80px" src={rocket} alt="" />
        <Box mt="24px">
          {config.getModalContent?.({
            ideaId: newIdeaIdParam,
          })}
        </Box>
      </Box>
    </Modal>
  );
};

export default SuccessModal;
