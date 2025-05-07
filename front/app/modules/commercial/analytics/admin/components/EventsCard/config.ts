import moment, { Moment } from 'moment';

import { Query, QuerySchema } from 'api/analytics/types';

import { formatCountValue } from 'components/admin/GraphCards/_utils/parse';
import {
  getDateFilter,
  getProjectFilter,
} from 'components/admin/GraphCards/_utils/query';

import { underscoreCase } from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/parse';
import {
  StatCardData,
  StatCardProps,
  StatCardConfig,
} from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/typings';

import messages from './messages';

// Type helps to keep this file and tests type safe although useStatCard returns a more generic object
export interface EventsCardLabels {
  events: string;
  periodLabel: string;
  totalEvents: string;
  upcoming: string;
  completed: string;
}

export const eventsConfig: StatCardConfig = {
  // Pass in the messages object
  messages,

  // Card title
  title: messages.events,

  // Create the data object
  dataParser: (responseData, labels: EventsCardLabels): StatCardData => {
    // Upcoming is not available if 3 stat arrays are not returned
    let total;
    let upcoming;
    let completed;
    if (responseData.length === 3) {
      [total, upcoming, completed] = responseData;
    } else {
      [total, completed] = responseData;
    }

    const cardData: StatCardData = {
      cardTitle: labels.events,
      fileName: underscoreCase(labels.events),
      stats: [],
    };
    cardData.stats.push({
      label: labels.totalEvents,
      value: formatCountValue(total[0].count),
    });
    upcoming &&
      cardData.stats.push({
        label: labels.upcoming,
        value: formatCountValue(upcoming[0].count),
      });
    cardData.stats.push({
      label: labels.completed,
      value: formatCountValue(completed[0].count),
    });

    return cardData;
  },

  // Analytics API query
  queryHandler: ({
    projectId,
    startAtMoment,
    endAtMoment,
  }: StatCardProps): Query => {
    const queryBase = (
      startMoment: Moment | null | undefined,
      endMoment: Moment | null,
      dateType: 'start' | 'end' | 'created'
    ): QuerySchema => {
      const querySchema: QuerySchema = {
        fact: 'event',
        aggregations: {
          all: 'count',
        },
      };

      const filters = {
        ...getDateFilter(`dimension_date_${dateType}`, startMoment, endMoment),
        ...getProjectFilter('dimension_project', projectId),
      };
      if (Object.keys(filters).length !== 0) {
        querySchema.filters = filters;
      }

      return querySchema;
    };

    const queryTotal: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'created'
    );

    const todayMoment = moment();
    const wayPastMoment = moment().set('year', 2010);
    const wayForwardMoment = moment().set('year', 2030);

    const queryUpcoming: QuerySchema = queryBase(
      todayMoment,
      wayForwardMoment,
      'start'
    );
    const queryCompleted: QuerySchema = queryBase(
      startAtMoment ? startAtMoment : wayPastMoment,
      endAtMoment ? endAtMoment : todayMoment,
      'end'
    );

    // Remove the upcoming query if there are start and end date filters
    let returnQuery = [queryTotal, queryUpcoming, queryCompleted];
    if (startAtMoment && endAtMoment) {
      returnQuery = [queryTotal, queryCompleted];
    }
    return {
      query: returnQuery,
    };
  },
};
