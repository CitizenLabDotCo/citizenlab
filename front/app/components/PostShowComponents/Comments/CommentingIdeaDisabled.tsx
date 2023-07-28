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
  const { enabled, disabled_reason: disabledReason } =
    idea.data.attributes.action_descriptor.commenting_idea;

  return (
    <CommentingDisabled
      commentingEnabled={enabled}
      commentingDisabledReason={disabledReason}
      projectId={idea?.data.relationships.project.data.id || null}
      phaseId={phaseId}
    />
  );
};

export default CommentingIdeaDisabled;
