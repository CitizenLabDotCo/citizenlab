import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import useLatestConversation from 'components/AiAssistant/useLatestConversation';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import DraftPreview from './DraftPreview';
import messages from './messages';

type Props = {
  opened: boolean;
  projectId: string;
  onClose: () => void;
};

const ProjectGenerator = ({ opened, projectId, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { conversation } = useLatestConversation(
    { surfaceKey: 'project_generator', subjectId: projectId },
    { enabled: opened }
  );

  const openProject = () => {
    clHistory.push(adminProjectsProjectPath(projectId));
    onClose();
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={1240}
      padding="0"
      fillContent
      closeOnClickOutside={false}
      header={formatMessage(messages.title)}
    >
      <Box display="flex" width="100%" height="85vh">
        <DraftPreview
          projectId={projectId}
          isNewProject={false}
          conversation={conversation}
          onOpenProject={openProject}
        />
      </Box>
    </Modal>
  );
};

export default ProjectGenerator;
