import React, { useEffect, useState } from 'react';

import useInitiativesCount from 'api/initiative_counts/useInitiativesCount';

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

const InitiativeFeedbackToggle = ({
  value,
  assignee,
  topics,
  status,
  searchTerm,
  onChange,
}: Props) => {
  const [currentSearch, setCurrentSearch] = useState(searchTerm);
  const { data: ideasCount } = useInitiativesCount({
    feedback_needed: true,
    assignee: assignee || undefined,
    topics: topics || undefined,
    initiative_status: status || undefined,
    search: currentSearch || undefined,
  });

  useEffect(() => {
    setCurrentSearch(searchTerm);
  }, [searchTerm]);

  const count = ideasCount?.data.attributes.count;

  return <FeedbackToggle value={value} count={count} onChange={onChange} />;
};

export default InitiativeFeedbackToggle;
