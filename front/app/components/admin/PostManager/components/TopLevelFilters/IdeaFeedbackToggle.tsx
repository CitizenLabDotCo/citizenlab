import React, { useEffect, useState } from 'react';

import { IQueryParameters } from 'api/idea_count/types';
import useIdeasCount from 'api/idea_count/useIdeasCount';

import FeedbackToggle from './FeedbackToggle';

interface Props {
  value: boolean;
  onChange: (feedbackNeeded: boolean | undefined) => void;
  assignee?: string | null;
  project?: string | null;
  phase?: string | null;
  topics?: string[] | null;
  status?: string | null;
  searchTerm?: string | null;
}

const IdeaFeedbackToggle = ({
  value,
  assignee,
  phase,
  project,
  topics,
  status,
  searchTerm,
  onChange,
}: Props) => {
  const projectIds = project ? [project] : undefined;
  const [queryParameters, setQueryParameters] = useState<IQueryParameters>({
    feedback_needed: true,
    assignee: assignee || undefined,
    projects: projectIds,
    phase,
    topics: topics || undefined,
    idea_status_id: status || undefined,
    search: searchTerm || undefined,
  });
  const { data: ideasCount } = useIdeasCount(queryParameters);

  useEffect(() => {
    setQueryParameters({
      ...queryParameters,
      search: searchTerm || undefined,
    });
  }, [searchTerm, queryParameters]);

  const count = ideasCount?.data.attributes.count;

  return <FeedbackToggle value={value} count={count} onChange={onChange} />;
};

export default IdeaFeedbackToggle;
