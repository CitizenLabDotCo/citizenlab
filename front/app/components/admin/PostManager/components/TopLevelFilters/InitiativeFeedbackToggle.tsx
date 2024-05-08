import React from 'react';

import useInitiativesCount from 'api/initiative_counts/useInitiativesCount';
import { IQueryParameters } from 'api/initiatives/types';

import FeedbackToggle from './FeedbackToggle';

interface Props {
  value: boolean;
  onChange: (feedbackNeeded: boolean | undefined) => void;
  // We are using initiatives, not initiatives_count query parameter types.
  // This is because the InitiativesCount component is used in the PostManager,
  // which uses the initiatives query parameter types.
  queryParameters: IQueryParameters;
}

const InitiativeFeedbackToggle = ({
  value,
  onChange,
  queryParameters,
}: Props) => {
  const { data: initiativesCount } = useInitiativesCount({
    feedback_needed: true,
    assignee: queryParameters.assignee,
    topics: queryParameters.topics,
    initiative_status: queryParameters.initiative_status,
    search: queryParameters.search,
  });

  return (
    <FeedbackToggle
      value={value}
      count={initiativesCount?.data.attributes.count}
      onChange={onChange}
    />
  );
};

export default InitiativeFeedbackToggle;
