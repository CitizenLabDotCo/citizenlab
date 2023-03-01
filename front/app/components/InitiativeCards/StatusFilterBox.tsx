import React, { memo, useCallback } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import StatusFilter from 'components/FilterBoxes/StatusFilter';

// resources
import GetInitiativeStatuses, {
  GetInitiativeStatusesChildProps,
} from 'resources/GetInitiativeStatuses';

// styling
import styled from 'styled-components';

// typings
import { IQueryParameters } from 'resources/GetInitiatives';
import useInitiativesFilterCounts from 'api/initiatives_filter_counts/useInitiativesFilterCounts';

const Container = styled.div``;

interface InputProps {
  selectedStatusId: string | null | undefined;
  selectedInitiativeFilters: Partial<IQueryParameters>;
  onChange: (arg: string | null) => void;
  className?: string;
}

interface DataProps {
  initiativeStatuses: GetInitiativeStatusesChildProps;
}

interface Props extends InputProps, DataProps {}

const StatusFilterBox = memo<Props>(
  ({
    selectedStatusId,
    initiativeStatuses,
    onChange,
    className,
    selectedInitiativeFilters,
  }) => {
    const queryParameters = {
      ...selectedInitiativeFilters,
      initiative_status: undefined,
      project_publication_status: 'published',
      publication_status: 'published',
    } as IQueryParameters;

    const { data: initiativesFilterCounts } =
      useInitiativesFilterCounts(queryParameters);

    const handleOnChange = useCallback(
      (nextSelectedStatusId: string | null) => {
        onChange(nextSelectedStatusId);
      },
      [onChange]
    );

    if (!isNilOrError(initiativeStatuses) && initiativeStatuses.length > 0) {
      return (
        <Container className={className}>
          <StatusFilter
            type="initiative"
            statuses={initiativeStatuses}
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

const Data = adopt<DataProps, InputProps>({
  initiativeStatuses: <GetInitiativeStatuses />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <StatusFilterBox {...inputProps} {...dataProps} />}
  </Data>
);
