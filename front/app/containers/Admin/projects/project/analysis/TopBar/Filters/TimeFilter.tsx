import TimeControl from 'containers/Admin/dashboard/components/TimeControl';
import moment from 'moment';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackEventByName } from 'utils/analytics';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import tracks from '../../tracks';

const TimeFilter = () => {
  const [searchParams] = useSearchParams();

  const endAtMoment = searchParams.get('published_at_to')
    ? moment(searchParams.get('published_at_to'))
    : moment();

  const startAtMoment = searchParams.get('published_at_from')
    ? moment(searchParams.get('published_at_from'))
    : undefined;

  return (
    <TimeControl
      onChange={(from, to) => {
        updateSearchParams({
          published_at_from: from?.format('YYYY-MM-DD'),
          published_at_to: to?.format('YYYY-MM-DD'),
        });
        trackEventByName(tracks.timeFilterUsed.name, {
          extra: {
            from: from?.format('YYYY-MM-DD'),
            to: to?.format('YYYY-MM-DD'),
          },
        });
      }}
      endAtMoment={endAtMoment}
      startAtMoment={startAtMoment}
    />
  );
};

export default TimeFilter;
