import React from 'react';

import { format, parseISO } from 'date-fns';

import TimeControl from 'containers/Admin/dashboard/components/TimeControl';

import { trackEventByName } from 'utils/analytics';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import tracks from '../../tracks';

const TimeFilter = () => {
  const searchParams = useSearch({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });

  const endAtMoment = searchParams.published_at_to
    ? parseISO(searchParams.published_at_to)
    : new Date();

  const startAtMoment = searchParams.published_at_from
    ? parseISO(searchParams.published_at_from)
    : undefined;

  return (
    <TimeControl
      onChange={(from, to) => {
        updateSearchParams({
          published_at_from: from ? format(from, 'yyyy-MM-dd') : undefined,
          published_at_to: to ? format(to, 'yyyy-MM-dd') : undefined,
        });
        trackEventByName(tracks.timeFilterUsed, {
          from: from ? format(from, 'yyyy-MM-dd') : undefined,
          to: to ? format(to, 'yyyy-MM-dd') : undefined,
        });
      }}
      endAtMoment={endAtMoment}
      startAtMoment={startAtMoment}
    />
  );
};

export default TimeFilter;
