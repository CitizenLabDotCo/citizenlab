import { useState, useEffect } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// query
import { query } from './query';

// parse
import { parseTimeSeries, parseStats } from './parse';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { deduceResolution } from './utils';

// typings
import { QueryParameters, Response, TimeSeries, Stats } from './typings';
import { IResolution } from 'components/admin/ResolutionControl';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [timeSeries, setTimeSeries] = useState<TimeSeries | NilOrError>();
  const [stats, setStats] = useState<Stats | NilOrError>();
  const [deducedResolution, setDeducedResolution] =
    useState<IResolution>(resolution);

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
          setTimeSeries(response);
          return;
        }

        const deducedResolution =
          deduceResolution(response.data[0]) ?? resolution;
        setDeducedResolution(deducedResolution);

        setStats(parseStats(response.data));
        setTimeSeries(
          parseTimeSeries(
            response.data[0],
            startAtMoment,
            endAtMoment,
            deducedResolution
          )
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [startAtMoment, endAtMoment, resolution]);

  return { timeSeries, stats, deducedResolution };
}
