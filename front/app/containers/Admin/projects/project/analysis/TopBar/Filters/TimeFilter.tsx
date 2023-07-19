import TimeControl from 'containers/Admin/dashboard/components/TimeControl';
import moment from 'moment';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

const TimeFilter = () => {
  const [searchParams] = useSearchParams();
  return (
    <TimeControl
      onChange={(from, to) => {
        updateSearchParams({
          published_at_from: from?.toISOString(),
          published_at_to: to?.toISOString(),
        });
      }}
      endAtMoment={
        searchParams.get('published_at_to')
          ? moment(searchParams.get('published_at_to'))
          : null
      }
      startAtMoment={
        searchParams.get('published_at_from')
          ? moment(searchParams.get('published_at_from'))
          : undefined
      }
    />
  );
};

export default TimeFilter;
