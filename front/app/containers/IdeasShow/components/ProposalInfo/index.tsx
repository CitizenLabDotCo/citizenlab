import React, { useEffect, useRef, useState } from 'react';

import moment from 'moment';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IIdeaStatusData } from 'api/idea_statuses/types';
import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';
import { IIdea, IIdeaData } from 'api/ideas/types';

import Answered from './Status/Answered';
import Expired from './Status/Expired';
import Ineligible from './Status/Ineligible';
import Proposed from './Status/Proposed';
import ThresholdReached from './Status/ThresholdReached';

export interface StatusComponentProps {
  idea: IIdeaData;
  ideaStatus: IIdeaStatusData;
}

/** Maps the idea status and whether the user reacted or not to the right component to render */
const componentMap = {
  proposed: Proposed,
  expired: Expired,
  answered: Answered,
  threshold_reached: ThresholdReached,
  ineligible: Ineligible,
  custom: () => <></>,
  prescreening: () => <></>,
};

interface Props {
  idea: IIdea;
  compact?: boolean;
}

const Status = ({ idea, compact }: Props) => {
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

  const { data: appConfiguration } = useAppConfiguration();
  if (!ideaStatus || !appConfiguration) return null;

  const expiresAt = moment(
    idea.data.attributes.expires_at,
    'YYYY-MM-DDThh:mm:ss.SSSZ'
  );
  const durationAsSeconds = moment
    .duration(expiresAt.diff(moment()))
    .asSeconds();
  const isExpired = durationAsSeconds < 0;
  const statusCode =
    ideaStatus.data.attributes.code === 'proposed' && isExpired
      ? 'expired'
      : ideaStatus.data.attributes.code;
  const StatusComponent = componentMap[statusCode];

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

  return (
    <StatusComponent
      idea={idea.data}
      ideaStatus={ideaStatus.data}
      onScrollToOfficialFeedback={onScrollToOfficialFeedback}
      compact={compact}
    />
  );
};

export default Status;
