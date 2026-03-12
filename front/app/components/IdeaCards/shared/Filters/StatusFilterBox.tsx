import React from 'react';

import { IdeaStatusParticipationMethod } from 'api/idea_statuses/types';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IPhase } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

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

// TODO: All comments in this file indicate we should probably split this in an "all inputs" and "phase" version.
const StatusFilterBox = ({
  selectedStatusId,
  onChange,
  className,
  ideaQueryParameters,
  participationMethod,
  phase,
}: Props) => {
  const prescreeningIdeationEnabled = useFeatureFlag({
    name: 'prescreening_ideation',
  });
  const showScreeningStatus = phase
    ? // This prescreening_mode setting is the same for ideation and proposal phases.
      // So no need to differentiate between prescreening and prescreening_ideation.
      !!phase.data.attributes.prescreening_mode
    : /*
        On the All inputs page, with no phase, we show all statuses if the prescreening_ideation feature is enabled (similar to platform input manager behavior).

        We only check for prescreening_ideation and not prescreening (proposals) because proposals are not shown ont the All inputs page (also similar to platform input manager behavior).
      */
      prescreeningIdeationEnabled;
  const { data: ideaStatuses } = useIdeaStatuses({
    queryParams: {
      // ideation is the fallback when we have no participationMethod (and are on the All inputs page as such).
      participation_method: participationMethod || 'ideation',
      ...(!showScreeningStatus && { exclude_codes: ['prescreening'] }),
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
