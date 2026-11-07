import { useEffect } from 'react';

import { getToolCalls } from 'api/ai_assistant_conversations/constructTranscript';
import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import useProjectById from 'api/projects/useProjectById';

import { getDraftProject, getProposedChanges, scrollToChange } from '../draft';

type Parameters = {
  projectId?: string;
  isNewProject: boolean;
  conversation?: IAiAssistantConversation;
};

// The saved project with the conversation's proposed changes on top.
const useDraft = ({ projectId, isNewProject, conversation }: Parameters) => {
  const { data: project } = useProjectById(projectId);

  const status = conversation?.data.attributes.status;
  const toolCalls = conversation ? getToolCalls(conversation) : [];
  const proposedChanges =
    status === 'awaiting_user' ? getProposedChanges(toolCalls) : [];
  // Before its setup is approved, a new project only has a placeholder title.
  const projectSetUp =
    !isNewProject ||
    toolCalls.some(
      ({ attributes }) =>
        attributes.name === 'update_project' && attributes.status === 'executed'
    );
  const firstChangeId = proposedChanges.at(0)?.id;
  const draftLoaded = !!project;

  // Waits for the draft, which would otherwise push the proposed change down while loading.
  useEffect(() => {
    if (firstChangeId && draftLoaded) scrollToChange(firstChangeId);
  }, [firstChangeId, draftLoaded]);

  const proposedProject =
    project && getDraftProject(project.data, proposedChanges);
  // The first setup of a new project replaces a placeholder: nothing worth comparing.
  const draftProject =
    proposedProject && !projectSetUp
      ? { ...proposedProject, previous: undefined }
      : proposedProject;

  return { status, projectSetUp, draftProject };
};

export default useDraft;
