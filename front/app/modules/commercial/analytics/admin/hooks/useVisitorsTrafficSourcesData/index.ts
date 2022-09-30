import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// utils
import { getProjectFilter, getDateFilter } from '../../utils/query';

// typings
import { QueryParameters } from './typings';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  const trafficSourcesQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter('dimension_date_last_action', startAt, endAt),
    },
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
  const [pieData, setPieData] = useState();

  useEffect(() => {
    const observable = analyticsStream<Response>(
      query({
        projectId,
        startAtMoment,
        endAtMoment,
      })
    ).observable;

    const subscription = observable.subscribe(() => {
      // TODO
    });

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment]);

  return { pieData };
}
