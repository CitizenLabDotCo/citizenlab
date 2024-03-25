import React from 'react';

import { IQueryParameters } from 'api/idea_count/types';
import useIdeasCount from 'api/idea_count/useIdeasCount';

import FeedbackToggle from './FeedbackToggle';

interface Props {
  value: boolean;
  onChange: (feedbackNeeded: boolean | undefined) => void;
  project?: string | null;
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
    idea_status_id: queryParameters.idea_status_id,
    search: queryParameters.search,
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
