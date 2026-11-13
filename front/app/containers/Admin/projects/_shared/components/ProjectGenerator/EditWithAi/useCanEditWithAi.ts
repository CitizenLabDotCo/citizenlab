import { IProjectData } from 'api/projects/types';

import useAiAssistantEnabled from 'components/AiAssistant/useAiAssistantEnabled';

// Mirrors the backend surface, which works on any draft, however it was created.
const useCanEditWithAi = (project: IProjectData) => {
  const assistantEnabled = useAiAssistantEnabled();

  return assistantEnabled && project.attributes.publication_status === 'draft';
};

export default useCanEditWithAi;
