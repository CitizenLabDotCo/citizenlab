import React, { useState } from 'react';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import ProjectGenerator from 'containers/Admin/projects/_shared/components/ProjectGenerator';

import useAiAssistantEnabled from 'components/AiAssistant/useAiAssistantEnabled';
import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import NewProjectModal, { NewProjectMode } from './NewProjectModal';

const NewProjectButton = () => {
  const redesignEnabled = useProjectBackofficeRedesign();
  const assistantEnabled = useAiAssistantEnabled();
  const [mode, setMode] = useState<NewProjectMode | null>(null);
  const [generatorOpened, setGeneratorOpened] = useState(false);

  const openModal = (mode: NewProjectMode) => {
    setGeneratorOpened(false);
    setMode(mode);
  };

  // Both ways in link to the other ways to start a project.
  const startNewProject = () => {
    if (assistantEnabled) {
      setGeneratorOpened(true);
    } else {
      setMode('scratch');
    }
  };

  if (!redesignEnabled) {
    return (
      <Button
        data-cy="e2e-new-project-button"
        className="intercom-admin-projects-new-project-button"
        to="/admin/projects/new"
        icon="plus-circle"
        buttonStyle="admin-dark"
      >
        <FormattedMessage {...messages.newProject} />
      </Button>
    );
  }

  return (
    <>
      <Button
        data-cy="e2e-new-project-button"
        className="intercom-admin-projects-new-project-button"
        icon="plus-circle"
        buttonStyle="admin-dark"
        onClick={startNewProject}
      >
        <FormattedMessage {...messages.newProject} />
      </Button>

      <NewProjectModal
        mode={mode}
        onUseTemplate={() => setMode('template')}
        onClose={() => setMode(null)}
      />
      <ProjectGenerator
        opened={generatorOpened}
        onClose={() => setGeneratorOpened(false)}
        onStartFromScratch={() => openModal('scratch')}
        onStartFromTemplate={() => openModal('template')}
      />
    </>
  );
};

export default NewProjectButton;
