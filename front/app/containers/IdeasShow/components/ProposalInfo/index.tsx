import React from 'react';

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

  onScrollToOfficialFeedback: () => void;
}

/** Maps the idea status and whether the user reacted or not to the right component to render */
const componentMap = {
  proposed: Proposed,
  expired: Expired,
  answered: Answered,
  threshold_reached: ThresholdReached,
  ineligible: Ineligible,
};

interface Props {
  idea: IIdea;
  onScrollToOfficialFeedback: () => void;
}

const Status = ({ idea, onScrollToOfficialFeedback }: Props) => {
  const { data: ideaStatus } = useIdeaStatus(
    idea.data.relationships.idea_status?.data?.id || ''
  );

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

  return (
    <StatusComponent
      idea={idea.data}
      ideaStatus={ideaStatus.data}
      onScrollToOfficialFeedback={onScrollToOfficialFeedback}
    />
  );
};

export default Status;
