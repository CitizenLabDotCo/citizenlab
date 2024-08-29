import React, { useEffect, useRef, useState } from 'react';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';
import { IIdea } from 'api/ideas/types';

import Status from './Status';

interface Props {
  idea: IIdea;
  compact?: boolean;
  ideaStatus: IIdeaStatusData;
}

const ProposalInfo = ({ idea, compact }: Props) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [
    a11y_pronounceLatestOfficialFeedbackPost,
    setA11y_pronounceLatestOfficialFeedbackPost,
  ] = useState(false);
  const { data: ideaStatus } = useIdeaStatus(
    idea.data.relationships.idea_status?.data?.id || ''
  );

  useEffect(() => {
    if (a11y_pronounceLatestOfficialFeedbackPost) {
      timeoutRef.current = setTimeout(
        () => setA11y_pronounceLatestOfficialFeedbackPost(false),
        2000
      );
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [a11y_pronounceLatestOfficialFeedbackPost]);

  const onScrollToOfficialFeedback = () => {
    const feedbackElement = document.getElementById('official-feedback-feed');
    if (feedbackElement) {
      feedbackElement.setAttribute('tabindex', '-1'); // Make the feedback element focusable

      feedbackElement.focus();
      feedbackElement.scrollIntoView({ behavior: 'smooth' });

      // Listen for focus out to restore default tabbing behavior
      feedbackElement.addEventListener('focusout', function () {
        feedbackElement.removeAttribute('tabindex');
      });

      setA11y_pronounceLatestOfficialFeedbackPost(true);
    }
  };

  if (!ideaStatus) return null;

  return (
    <Status
      idea={idea.data}
      ideaStatus={ideaStatus.data}
      onScrollToOfficialFeedback={onScrollToOfficialFeedback}
      compact={compact}
    />
  );
};

export default ProposalInfo;
