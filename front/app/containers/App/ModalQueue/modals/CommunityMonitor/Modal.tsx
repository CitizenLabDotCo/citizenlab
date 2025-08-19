import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { set } from 'js-cookie';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SurveyTimeToComplete from 'components/SurveyTimeToComplete';
import Modal from 'components/UI/Modal';

import { useModalQueue } from '../..';

import QuestionPreview from './components/QuestionPreview';

const CommunityMonitorModal = () => {
  const { removeModal } = useModalQueue();
  const isCommunityMonitorEnabled = useFeatureFlag({
    name: 'community_monitor',
  });
  const { data: project } = useCommunityMonitorProject({
    enabled: isCommunityMonitorEnabled,
  });
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  const onClose = () => {
    // Set cookie expiration date to 3 months from today
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 3);

    set('community_monitor_modal_seen', 'true', {
      expires: expirationDate,
    });
    removeModal('community-monitor');
  };

  if (!project || !phaseId) {
    return null;
  }

  return (
    <Modal opened close={onClose} width="560px">
      <Box mt="40px">
        <QuestionPreview
          projectSlug={project.data.attributes.slug}
          phaseId={phaseId}
          projectId={project.data.id}
          onClose={onClose}
        />
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <SurveyTimeToComplete projectId={project.data.id} phaseId={phaseId} />
      </Box>
    </Modal>
  );
};

export default CommunityMonitorModal;
