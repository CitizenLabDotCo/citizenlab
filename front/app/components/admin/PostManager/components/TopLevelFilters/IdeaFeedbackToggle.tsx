import React from 'react';

import useIdeasCount from 'api/idea_count/useIdeasCount';
import { IQueryParameters } from 'api/ideas/types';

import FeedbackToggle from './FeedbackToggle';

interface Props {
  value: boolean;
  onChange: (feedbackNeeded: boolean | undefined) => void;
  project?: string | null;
  // We are using ideas, not ideas_count query parameter types.
  // This is because the IdeasCount component is used in the PostManager,
  // which uses the ideas query parameter types.
  queryParameters: IQueryParameters;
}

const IdeaFeedbackToggle = ({
  value,
  project,
  onChange,
  queryParameters,
}: Props) => {
  const { data: ideasCount } = useIdeasCount({
    feedback_needed: true,
    assignee: queryParameters.assignee,
    projects: project ? [project] : undefined,
    phase: queryParameters.phase,
    topics: queryParameters.topics,
    idea_status_id: queryParameters.idea_status,
    search: queryParameters.search,
    transitive: queryParameters.transitive,
  });

  return (
    <FeedbackToggle
      value={value}
      count={ideasCount?.data.attributes.count}
      onChange={onChange}
    />
  );
};

export default IdeaFeedbackToggle;
