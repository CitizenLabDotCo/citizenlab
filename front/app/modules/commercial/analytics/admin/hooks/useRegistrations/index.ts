import { useState, useEffect } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// query
import { query } from './query';

// typings
import { QueryParameters, Response, TimeSeries, Stats } from './typings';
import { NilOrError } from 'utils/helperUtils';

export default function useRegistrations({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [timeSeries, setTimeSeries] = useState<TimeSeries | NilOrError>();
  const [stats, setStats] = useState<Stats | NilOrError>();

  useEffect(() => {
    const observable = analyticsStream<Response>(
      query({
        startAtMoment,
        endAtMoment,
        resolution,
      })
    ).observable;

    const subscription = observable.subscribe((response) => {});

    return () => subscription.unsubscribe();
  }, [startAtMoment, endAtMoment, resolution]);

  return { timeSeries, stats };
}
