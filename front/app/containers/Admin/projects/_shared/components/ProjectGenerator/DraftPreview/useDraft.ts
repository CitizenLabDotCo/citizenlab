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
  conversation?: IAiAssistantConversation;
};

// The saved project, phases and events with the conversation's proposed changes on top.
const useDraft = ({ projectId, conversation }: Parameters) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId, 'all');
  const { data: events } = useEvents(
    { projectIds: projectId ? [projectId] : undefined, pageSize: 1000 },
    { enabled: !!projectId }
  );

  const proposedChanges =
    conversation?.data.attributes.status === 'awaiting_user'
      ? getProposedChanges(getToolCalls(conversation))
      : [];
  const firstChangeId = proposedChanges.at(0)?.id;
  const draftLoaded = !!project && !!phases && !!events;

  // Waits for the draft, which would otherwise push the proposed change down while loading.
  useEffect(() => {
    if (firstChangeId && draftLoaded) scrollToChange(firstChangeId);
  }, [firstChangeId, draftLoaded]);

  return {
    draftProject: project && getDraftProject(project.data, proposedChanges),
    draftPhases: getDraftPhases(phases?.data ?? [], proposedChanges),
    draftEvents: getDraftEvents(events?.data ?? [], proposedChanges),
  };
};

export default useDraft;
