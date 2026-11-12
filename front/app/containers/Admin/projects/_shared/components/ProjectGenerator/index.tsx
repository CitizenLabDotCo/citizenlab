import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import useLatestConversation from 'components/AiAssistant/useLatestConversation';
import Modal from 'components/UI/Modal';

import clHistory from 'utils/cl-router/history';

import DraftPreview from './DraftPreview';
import GeneratorChat from './GeneratorChat';
import useRefreshDraftOnChanges from './useRefreshDraftOnChanges';

const TITLE_ID = 'project-generator-title';

type Props = {
  opened: boolean;
  // Without it, the first message creates a new draft.
  projectId?: string;
  onClose: () => void;
  onStartFromScratch?: () => void;
};

const ProjectGenerator = ({
  opened,
  projectId: draftProjectId,
  onClose,
  onStartFromScratch,
}: Props) => {
  const [createdProjectId, setCreatedProjectId] = useState<string>();
  const projectId = draftProjectId ?? createdProjectId;
  // A new project only has a placeholder title until the assistant sets it up.
  const isNewProject = !draftProjectId;
  const { conversation } = useLatestConversation(
    { surfaceKey: 'project_generator', subjectId: projectId },
    { enabled: opened }
  );
  useRefreshDraftOnChanges(conversation);

  const close = () => {
    setCreatedProjectId(undefined);
    onClose();
  };

  const openProject = () => {
    if (projectId) clHistory.push(adminProjectsProjectPath(projectId));
    close();
  };

  return (
    <Modal
      opened={opened}
      close={close}
      variant="bo"
      width={1240}
      padding="0"
      fillContent
      hideCloseButton
      closeOnClickOutside={false}
      ariaLabelledBy={TITLE_ID}
    >
      <Box display="flex" width="100%" height="85vh">
        <GeneratorChat
          projectId={projectId}
          isNewProject={isNewProject}
          conversation={conversation}
          titleId={TITLE_ID}
          onProjectCreated={setCreatedProjectId}
          onStartFromScratch={onStartFromScratch}
          onClose={close}
        />
        <DraftPreview
          projectId={projectId}
          isNewProject={isNewProject}
          conversation={conversation}
          onOpenProject={openProject}
        />
      </Box>
    </Modal>
  );
};

export default ProjectGenerator;
