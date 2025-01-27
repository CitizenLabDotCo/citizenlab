import React, { useState, useEffect } from 'react';

import { Box, Image } from '@citizenlab/cl2-component-library';
import rocket from 'assets/img/rocket.png';
import { useSearchParams } from 'react-router-dom';

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

import { isReady } from './utils';
import { Multiloc } from 'typings';

interface Props {
  projectId: string;
  previewSuccessMessage?: Multiloc;
}

const SuccessModal = ({ projectId, previewSuccessMessage }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const [queryParams] = useSearchParams();
  const showModalParam = !!queryParams.get('show_modal');
  const phaseIdParam = queryParams.get('phase_id');
  const [newIdeaIdParam] = useState(
    queryParams.get('new_idea_id') ?? undefined
  );
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

  // If the idea has no author relationship,
  // it was either created through 'anyone' permissions or with
  // the anonymous toggle on. In these cases, we show the idea id in the modal.
  const showIdeaIdInModal = idea
    ? !idea.data.relationships.author?.data
    : false;

  const successMessage =
    previewSuccessMessage ||
    participationContext?.attributes.form_success_multiloc ||
    undefined;

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
        <Box mt="24px">
          {config.getModalContent({
            ideaId: newIdeaIdParam,
            showIdeaId: showIdeaIdInModal,
            successMessage: successMessage,
          })}
        </Box>
      </Box>
    </Modal>
  );
};

export default SuccessModal;
