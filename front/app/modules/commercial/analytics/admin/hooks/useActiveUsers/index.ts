import { useState, useEffect } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// query
import { query } from './query';

// parse
import { parseTimeSeries, parseStats } from './parse';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { QueryParameters, Response, TimeSeries, Stats } from './typings';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [timeSeries, setTimeSeries] = useState<TimeSeries | NilOrError>();
  const [stats, setStats] = useState<Stats | NilOrError>();

  useEffect(() => {
    const observable = analyticsStream<Response>(
      query({
        projectId,
        startAtMoment,
        endAtMoment,
        resolution,
      })
    ).observable;

    const subscription = observable.subscribe(
      (response: Response | NilOrError) => {
        if (isNilOrError(response)) {
          setStats(response);
          return;
        }

        setStats(parseStats(response.data));
        setTimeSeries(
          parseTimeSeries(
            response.data[0],
            startAtMoment,
            endAtMoment,
            resolution
          )
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [startAtMoment, endAtMoment, resolution]);

  return { timeSeries, stats };
}
