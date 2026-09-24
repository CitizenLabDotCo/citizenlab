import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

/**
 * Mirrors the backend's `feedback_needed` scope on Idea, which drives the
 * "Awaiting reply" count, so a row and the count never disagree.
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
