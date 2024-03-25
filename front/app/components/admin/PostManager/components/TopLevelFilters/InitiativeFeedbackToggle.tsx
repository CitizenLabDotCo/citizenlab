import React from 'react';

import { IQueryParameters } from 'api/initiative_counts/types';
import useInitiativesCount from 'api/initiative_counts/useInitiativesCount';

import FeedbackToggle from './FeedbackToggle';

interface Props {
  value: boolean;
  onChange: (feedbackNeeded: boolean | undefined) => void;
  queryParameters: IQueryParameters;
}

const InitiativeFeedbackToggle = ({
  value,
  onChange,
  queryParameters,
}: Props) => {
  const { data: ideasCount } = useInitiativesCount({
    feedback_needed: true,
    assignee: queryParameters.assignee,
    topics: queryParameters.topics,
    initiative_status: queryParameters.initiative_status,
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

export default InitiativeFeedbackToggle;
