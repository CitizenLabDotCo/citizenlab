import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

export const topicIds = (idea: IIdeaData) =>
  idea.relationships.input_topics?.data.map((topic) => topic.id) ?? [];

export const phaseIds = (idea: IIdeaData) =>
  idea.relationships.phases.data.map((phase) => phase.id);

/**
 * Mirrors the backend's `feedback_needed` scope on Idea, so a row's mark and
 * the reply filter never disagree.
 */
export const isAwaitingReply = (
  idea: IIdeaData,
  statuses: IIdeaStatusData[]
) => {
  const code = statuses.find(
    (status) => status.id === idea.relationships.idea_status.data?.id
  )?.attributes.code;

  if (code === 'threshold_reached') return true;
  return code === 'proposed' && idea.attributes.official_feedbacks_count === 0;
};
