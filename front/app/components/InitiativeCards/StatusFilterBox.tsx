import React, { memo, useCallback } from 'react';

// components
import StatusFilter from 'components/FilterBoxes/StatusFilter';

// styling
import styled from 'styled-components';

// typings
import { IQueryParameters } from 'api/initiatives/types';
import useInitiativesFilterCounts from 'api/initiatives_filter_counts/useInitiativesFilterCounts';
import useInitiativeStatuses from 'api/initiative_statuses/useInitiativeStatuses';

const Container = styled.div``;

interface Props {
  selectedStatusId: string | null | undefined;
  selectedInitiativeFilters: Partial<IQueryParameters>;
  onChange: (arg: string | null) => void;
  className?: string;
}

const StatusFilterBox = memo<Props>(
  ({ selectedStatusId, onChange, className, selectedInitiativeFilters }) => {
    const queryParameters = {
      ...selectedInitiativeFilters,
      initiative_status: undefined,
      publication_status: 'published',
    } as IQueryParameters;
    const { data: initiativeStatuses } = useInitiativeStatuses();
    const { data: initiativesFilterCounts } =
      useInitiativesFilterCounts(queryParameters);

    const handleOnChange = useCallback(
      (nextSelectedStatusId: string | null) => {
        onChange(nextSelectedStatusId);
      },
      [onChange]
    );

    if (initiativeStatuses && initiativeStatuses.data.length > 0) {
      return (
        <Container className={className}>
          <StatusFilter
            type="initiative"
            statuses={initiativeStatuses.data}
            filterCounts={initiativesFilterCounts?.data.attributes}
            selectedStatusId={selectedStatusId}
            onChange={handleOnChange}
          />
        </Container>
      );
    }

    return null;
  }
);

export default StatusFilterBox;
