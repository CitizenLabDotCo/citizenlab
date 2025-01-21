import React from 'react';

import { IdeaStatusParticipationMethod } from 'api/idea_statuses/types';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IPhase } from 'api/phases/types';

import StatusFilter from 'components/FilterBoxes/StatusFilter';

interface Props {
  selectedStatusId: string | null | undefined;
  ideaQueryParameters: IIdeasFilterCountsQueryParameters;
  onChange: (arg: string | null) => void;
  className?: string;
  participationMethod?: IdeaStatusParticipationMethod;
  // Should be defined whenever this component is displayed within a project phase context.
  phase: IPhase | undefined;
}

const StatusFilterBox = ({
  selectedStatusId,
  onChange,
  className,
  ideaQueryParameters,
  participationMethod,
  phase,
}: Props) => {
  /* 
    On project phase pages. If the phase setting is undefined: the BE's default is to exclude the screening status when the prescreening_ideation feature is not enabled. If prescreening_ideation is enabled, the phase setting should be defined (either true or false) for new phases. For old phases, that were created before the feature was introduced, the setting is undefined. This will result in excludeScreeningStatus being true (!undefined).
    
    On the All inputs page, with no phase, we follow default BE behavior: show all statuses if the prescreening_ideation feature is enabled (similar to general input manager behavior). 
  */
  const excludeScreeningStatus = !phase?.data.attributes.prescreening_enabled;

  const { data: ideaStatuses } = useIdeaStatuses({
    queryParams: {
      participation_method: participationMethod,
      exclude_screening_status: excludeScreeningStatus,
    },
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
