import React, { memo, useCallback } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import StatusFilter from 'components/FilterBoxes/StatusFilter';

// resources
import GetInitiativeStatuses, {
  GetInitiativeStatusesChildProps,
} from 'resources/GetInitiativeStatuses';
import GetInitiativesFilterCounts, {
  GetInitiativesFilterCountsChildProps,
} from 'resources/GetInitiativesFilterCounts';

// styling
import styled from 'styled-components';

// typings
import { IQueryParameters } from 'resources/GetInitiatives';

const Container = styled.div``;

interface InputProps {
  selectedStatusId: string | null | undefined;
  selectedInitiativeFilters: Partial<IQueryParameters>;
  onChange: (arg: string | null) => void;
  className?: string;
}

interface DataProps {
  initiativeStatuses: GetInitiativeStatusesChildProps;
  initiativesFilterCounts: GetInitiativesFilterCountsChildProps;
}

interface Props extends InputProps, DataProps {}

const StatusFilterBox = memo<Props>(
  ({
    selectedStatusId,
    initiativeStatuses,
    initiativesFilterCounts,
    onChange,
    className,
  }) => {
    const handleOnChange = useCallback(
      (nextSelectedStatusId: string | null) => {
        onChange(nextSelectedStatusId);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    if (!isNilOrError(initiativeStatuses) && initiativeStatuses.length > 0) {
      return (
        <Container className={className}>
          <StatusFilter
            type="initiative"
            statuses={initiativeStatuses}
            filterCounts={initiativesFilterCounts}
            selectedStatusId={selectedStatusId}
            onChange={handleOnChange}
          />
        </Container>
      );
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  initiativeStatuses: <GetInitiativeStatuses />,
  initiativesFilterCounts: ({ selectedInitiativeFilters, render }) => {
    const queryParameters = {
      ...selectedInitiativeFilters,
      initiative_status: undefined,
      project_publication_status: 'published',
      publication_status: 'published',
    } as Partial<IQueryParameters>;

    return (
      <GetInitiativesFilterCounts queryParameters={queryParameters}>
        {render}
      </GetInitiativesFilterCounts>
    );
  },
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <StatusFilterBox {...inputProps} {...dataProps} />}
  </Data>
);
