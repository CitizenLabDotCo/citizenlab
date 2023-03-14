import React from 'react';

// components
import StatusFilter from 'components/FilterBoxes/StatusFilter';

// typings
import { IIdeasFilterCountsQueryParameters } from 'services/ideas';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

interface Props {
  selectedStatusId: string | null | undefined;
  selectedIdeaFilters: IIdeasFilterCountsQueryParameters;
  onChange: (arg: string | null) => void;
  className?: string;
}

const StatusFilterBox = ({
  selectedStatusId,
  onChange,
  className,
  selectedIdeaFilters,
}: Props) => {
  const { data: ideaStatuses } = useIdeaStatuses();
  const { data: ideasFilterCounts } = useIdeasFilterCounts(selectedIdeaFilters);

  const handleOnChange = (nextSelectedStatusId: string | null) => {
    onChange(nextSelectedStatusId);
  };

  if (ideaStatuses && ideaStatuses.data.length > 0 && ideasFilterCounts) {
    return (
      <div className={className}>
        <StatusFilter
          type="idea"
          statuses={ideaStatuses.data}
          filterCounts={ideasFilterCounts?.data.attributes}
          selectedStatusId={selectedStatusId}
          onChange={handleOnChange}
        />
      </div>
    );
  }

  return null;
};

export default StatusFilterBox;
