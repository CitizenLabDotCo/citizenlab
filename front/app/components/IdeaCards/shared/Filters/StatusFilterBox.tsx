import React from 'react';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import StatusFilter from 'components/FilterBoxes/StatusFilter';

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
  const { data: ideaStatuses } = useIdeaStatuses({
    participation_method: 'ideation',
  });
  const { data: ideasFilterCounts } = useIdeasFilterCounts({
    ...selectedIdeaFilters,
    idea_status: undefined,
  });

  const handleOnChange = (nextSelectedStatusId: string | null) => {
    onChange(nextSelectedStatusId);
  };

  if (ideaStatuses && ideaStatuses.data.length > 0 && ideasFilterCounts) {
    return (
      <div className={className}>
        <StatusFilter
          statuses={ideaStatuses.data}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
