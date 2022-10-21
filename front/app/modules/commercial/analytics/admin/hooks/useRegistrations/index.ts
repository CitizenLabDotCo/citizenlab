import { useState, useEffect } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// query
import { query } from './query';

// parse
import { parseTimeSeries, parseStats } from './parse';

// utils
import { deduceResolution } from './utils';

// typings
import { QueryParameters, Response, TimeSeries, Stats } from './typings';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { IResolution } from 'components/admin/ResolutionControl';

export default function useRegistrations({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [deducedResolution, setDeducedResolution] =
    useState<IResolution>(resolution);
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

    const subscription = observable.subscribe(
      (response: Response | NilOrError) => {
        if (isNilOrError(response)) {
          setTimeSeries(response);
          setStats(response);
          return;
        }

        const deducedResolution =
          deduceResolution(response.data[0]) ?? resolution;

        setDeducedResolution(deducedResolution);

        setTimeSeries(
          parseTimeSeries(
            response.data[0],
            startAtMoment,
            endAtMoment,
            deducedResolution
          )
        );

        setStats(parseStats(response.data));
      }
    );

    return () => subscription.unsubscribe();
  }, [startAtMoment, endAtMoment, resolution]);

  return { deducedResolution, timeSeries, stats };
}
