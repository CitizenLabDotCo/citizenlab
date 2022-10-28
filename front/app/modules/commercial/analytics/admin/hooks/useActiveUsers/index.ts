import { useState, useEffect } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// query
import { query } from './query';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { QueryParameters, Response } from './typings';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [state, setState] = useState<NilOrError>();

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
          setState(response);
          return;
        }

        // TODO
      }
    );

    return () => subscription.unsubscribe();
  }, [startAtMoment, endAtMoment, resolution]);

  return state;
}
