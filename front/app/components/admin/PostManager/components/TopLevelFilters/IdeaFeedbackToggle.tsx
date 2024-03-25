import React, { useEffect, useState } from 'react';

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
  const [currentSearch, setCurrentSearch] = useState(searchTerm);
  const { data: ideasCount } = useIdeasCount({
    feedback_needed: true,
    assignee: assignee || undefined,
    projects: projectIds,
    phase,
    topics: topics || undefined,
    idea_status_id: status || undefined,
    search: currentSearch || undefined,
  });

  useEffect(() => {
    setCurrentSearch(searchTerm);
  }, [searchTerm]);

  const count = ideasCount?.data.attributes.count;

  return <FeedbackToggle value={value} count={count} onChange={onChange} />;
};

export default IdeaFeedbackToggle;
