import { useEffect } from 'react';

import { getToolCalls } from 'api/ai_assistant_conversations/constructTranscript';
import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import useEvents from 'api/events/useEvents';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import {
  getDraftEvents,
  getDraftPhases,
  getDraftProject,
  getProposedChanges,
  scrollToChange,
} from '../draft';

type Parameters = {
  projectId?: string;
  isNewProject: boolean;
  conversation?: IAiAssistantConversation;
};

// The saved project, phases and events with the conversation's proposed changes on top.
const useDraft = ({ projectId, isNewProject, conversation }: Parameters) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases, isLoading: phasesLoading } = usePhases(
    projectId,
    'all'
  );
  const { data: events, isLoading: eventsLoading } = useEvents(
    { projectIds: projectId ? [projectId] : undefined, pageSize: 1000 },
    { enabled: !!projectId }
  );

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
  const draftLoaded = !!project && !!phases && !!events;

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
  const draftPhases = getDraftPhases(phases?.data ?? [], proposedChanges);
  const draftEvents = getDraftEvents(events?.data ?? [], proposedChanges);

  return {
    status,
    projectSetUp,
    draftProject,
    draftPhases,
    draftEvents,
    timelineLoading: phasesLoading || eventsLoading,
  };
};

export default useDraft;
