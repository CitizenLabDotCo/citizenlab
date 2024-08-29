import React from 'react';

import styled from 'styled-components';

import useInitiativesCount from 'api/initiative_counts/useInitiativesCount';
import { IQueryParameters } from 'api/initiatives/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

interface Props {
  // We are using initiatives, not initiatives_count query parameter types.
  // This is because the InitiativesCount component is used in the PostManager,
  // which uses the initiatives query parameter types.
  queryParameters: IQueryParameters;
}

const InitiativesCount = ({ queryParameters }: Props) => {
  const { data: initiativesCount } = useInitiativesCount({
    feedback_needed: queryParameters.feedback_needed,
    assignee: queryParameters.assignee,
    topics: queryParameters.topics,
    initiative_status: queryParameters.initiative_status,
    search: queryParameters.search,
  });

  if (!initiativesCount) return null;

  const initiativesMatchingFiltersCount =
    initiativesCount.data.attributes.count;

  return (
    <Container>
      {/*
          If there are no initiatives, we have an 'empty container' to indicate there are no initiatives matching the filters.
          Hence we only show this count when there's at least 1 initiative.
        */}
      {initiativesMatchingFiltersCount > 0 &&
        (initiativesMatchingFiltersCount === 1 ? (
          <FormattedMessage {...messages.oneInitiative} />
        ) : (
          <FormattedMessage
            {...messages.multipleInitiatives}
            values={{ initiativesCount: initiativesMatchingFiltersCount }}
          />
        ))}
    </Container>
  );
};

export default InitiativesCount;
