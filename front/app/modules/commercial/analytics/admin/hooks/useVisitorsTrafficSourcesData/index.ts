import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// parse
import { parsePieData } from './parse';

// utils
// import { getProjectFilter, getDateFilter } from '../../utils/query';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { QueryParameters, Response, PieRow } from './typings';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  if (1 + 1 === 3) {
    console.log(projectId, startAt, endAt);
  }

  const trafficSourcesQuery: QuerySchema = {
    fact: 'visit',
    // filters: {
    //   dimension_user: {
    //     role: ['citizen', null],
    //   },
    //   ...getProjectFilter('dimension_projects', projectId),
    //   ...getDateFilter('dimension_date_last_action', startAt, endAt),
    // },
    groups: 'dimension_referrer_type.id',
    aggregations: {
      all: 'count',
      'dimension_referrer_type.name': 'first',
    },
  };

  return { query: trafficSourcesQuery };
};

export default function useVisitorsTrafficSourcesData({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const [pieData, setPieData] = useState<PieRow[] | NilOrError>();

  useEffect(() => {
    const observable = analyticsStream<Response>(
      query({
        projectId,
        startAtMoment,
        endAtMoment,
      })
    ).observable;

    const subscription = observable.subscribe(
      (response: Response | NilOrError) => {
        if (isNilOrError(response)) {
          setPieData(response);
          return;
        }

        setPieData(parsePieData(response.data));
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment]);

  return { pieData };
}
