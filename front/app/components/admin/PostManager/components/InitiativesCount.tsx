import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { IQueryParameters } from 'api/initiative_counts/types';
import useInitiativesCount from 'api/initiative_counts/useInitiativesCount';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

interface Props {
  feedbackNeeded: boolean;
  assignee: string | null | undefined;
  topics: string[] | null | undefined;
  initiativeStatus: string | null | undefined;
  searchTerm: string | null | undefined;
}

const InitiativesCount = (inputProps: Props) => {
  const [queryParameters, setQueryParameters] = useState<IQueryParameters>({
    feedback_needed: inputProps.feedbackNeeded,
    assignee: inputProps.assignee || undefined,
    topics: inputProps.topics || undefined,
    initiative_status: inputProps.initiativeStatus || undefined,
  });
  const { data: initiativesCount } = useInitiativesCount(queryParameters);

  useEffect(() => {
    setQueryParameters({
      ...queryParameters,
      search: inputProps.searchTerm || undefined,
    });
  }, [inputProps.searchTerm, queryParameters]);

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
