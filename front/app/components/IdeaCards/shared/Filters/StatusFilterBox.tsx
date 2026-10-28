import React from 'react';

import { IdeaStatusParticipationMethod } from 'api/idea_statuses/types';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { IIdeasFilterCountsQueryParameters } from 'api/ideas_filter_counts/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IPhase } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import messages from 'components/FilterBoxes/messages';
import SingleSelectFilter from 'components/FilterBoxes/SingleSelectFilter';

import { useIntl } from 'utils/cl-intl';
import { capitalize } from 'utils/textUtils';

interface Props {
  selectedStatusId: string | null | undefined;
  ideaQueryParameters: IIdeasFilterCountsQueryParameters;
  onChange: (arg: string | null) => void;
  participationMethod?: IdeaStatusParticipationMethod;
  // Should be defined whenever this component is displayed within a project phase context.
  phase: IPhase | undefined;
}

// TODO: All comments in this file indicate we should probably split this in an "all inputs" and "phase" version.
const StatusFilterBox = ({
  selectedStatusId,
  onChange,
  ideaQueryParameters,
  participationMethod,
  phase,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const prescreeningIdeationEnabled = useFeatureFlag({
    name: 'prescreening_ideation',
  });
  const showScreeningStatus = phase
    ? !!phase.data.attributes.effective_prescreening_mode
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

  if (ideaStatuses && ideaStatuses.data.length > 0 && ideasFilterCounts) {
    const statusCounts: Partial<Record<string, number>> =
      ideasFilterCounts.data.attributes.idea_status_id;

    return (
      <SingleSelectFilter
        title={formatMessage(messages.statusTitle)}
        options={ideaStatuses.data.map((status) => ({
          id: status.id,
          label: capitalize(localize(status.attributes.title_multiloc)),
          count: statusCounts[status.id] ?? 0,
          color: status.attributes.color,
        }))}
        totalCount={ideasFilterCounts.data.attributes.total}
        selectedId={selectedStatusId}
        onChange={onChange}
      />
    );
  }

  return null;
};

export default StatusFilterBox;
