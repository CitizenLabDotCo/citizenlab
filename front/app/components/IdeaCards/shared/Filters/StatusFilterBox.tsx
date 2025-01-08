import React from 'react';

import { IdeaStatusParticipationMethod } from 'api/idea_statuses/types';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import StatusFilter from 'components/FilterBoxes/StatusFilter';

interface Props {
  selectedStatusId: string | null | undefined;
  ideaQueryParameters: IIdeasFilterCountsQueryParameters;
  onChange: (arg: string | null) => void;
  className?: string;
  participationMethod?: IdeaStatusParticipationMethod;
}

const StatusFilterBox = ({
  selectedStatusId,
  onChange,
  className,
  ideaQueryParameters,
  participationMethod,
}: Props) => {
  const { data: ideaStatuses } = useIdeaStatuses({
    participation_method: participationMethod,
  });
  const { data: ideasFilterCounts } = useIdeasFilterCounts({
    ...ideaQueryParameters,
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
