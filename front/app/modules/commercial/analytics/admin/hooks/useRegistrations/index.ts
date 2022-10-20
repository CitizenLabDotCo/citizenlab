import { useState, useEffect } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// query
import { query } from './query';

// typings
import { QueryParameters, Response } from './typings';

export default function useRegistrations({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [timeSeries /*, setTimeSeries */] = useState();

  useEffect(() => {
    const observable = analyticsStream<Response>(
      query({
        startAtMoment,
        endAtMoment,
        resolution,
      })
    ).observable;

    const subscription = observable.subscribe((response) => {
      console.log(response);
    });

    return () => subscription.unsubscribe();
  }, [startAtMoment, endAtMoment, resolution]);

  return {
    timeSeries,
  };
}
