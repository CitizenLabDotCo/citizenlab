// libraries
import React from 'react';
import CommentingDisabled from './CommentingDisabled';
import { IIdea } from 'api/ideas/types';

const CommentingIdeaDisabled = ({
  idea,
  phaseId,
}: {
  idea: IIdea;
  phaseId?: string;
}) => {
  const actionDescriptor =
    idea.data.attributes.action_descriptor.commenting_idea;

  const commentingEnabled = actionDescriptor.enabled;
  const commentingDisabledReason = actionDescriptor.disabled_reason;

  return (
    <CommentingDisabled
      commentingEnabled={!!commentingEnabled}
      commentingDisabledReason={commentingDisabledReason}
      projectId={idea?.data.relationships.project.data.id || null}
      phaseId={phaseId}
    />
  );
};

export default CommentingIdeaDisabled;
