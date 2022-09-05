import React, { memo, useCallback } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import StatusFilter from 'components/FilterBoxes/StatusFilter';

// resources
import GetIdeaStatuses, {
  GetIdeaStatusesChildProps,
} from 'resources/GetIdeaStatuses';
import GetIdeasFilterCounts, {
  GetIdeasFilterCountsChildProps,
} from 'resources/GetIdeasFilterCounts';

// styling
import styled from 'styled-components';

// typings
import { IQueryParameters } from 'resources/GetIdeas';

const Container = styled.div``;

interface InputProps {
  selectedStatusId: string | null | undefined;
  selectedIdeaFilters: Partial<IQueryParameters>;
  onChange: (arg: string | null) => void;
  className?: string;
}

interface DataProps {
  ideaStatuses: GetIdeaStatusesChildProps;
  ideasFilterCounts: GetIdeasFilterCountsChildProps;
}

interface Props extends InputProps, DataProps {}

const StatusFilterBox = memo<Props>(
  ({
    selectedStatusId,
    ideaStatuses,
    ideasFilterCounts,
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

    if (!isNilOrError(ideaStatuses) && ideaStatuses.length > 0) {
      return (
        <Container className={className}>
          <StatusFilter
            type="idea"
            statuses={ideaStatuses}
            filterCounts={ideasFilterCounts}
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
  ideaStatuses: <GetIdeaStatuses />,
  ideasFilterCounts: ({ selectedIdeaFilters, render }) => {
    const queryParameters = {
      ...selectedIdeaFilters,
      idea_status: undefined,
      project_publication_status: 'published',
      publication_status: 'published',
    } as Partial<IQueryParameters>;

    return (
      <GetIdeasFilterCounts queryParameters={queryParameters}>
        {render}
      </GetIdeasFilterCounts>
    );
  },
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <StatusFilterBox {...inputProps} {...dataProps} />}
  </Data>
);
