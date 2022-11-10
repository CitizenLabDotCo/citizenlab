import messages from './messages';

// Utils
import { formatCountValue } from '../../utils/parse';
import { getDateFilter, getProjectFilter } from '../../utils/query';

// Typings
import {
  StatCardChartData,
  StatCardProps,
  StatCardConfig,
} from '../../hooks/useStatCard/typings';
import { Query, QuerySchema } from '../../services/analyticsFacts';
import { Moment } from 'moment';
import { WrappedComponentProps } from 'react-intl';

export const eventsConfig: StatCardConfig = {
  // Card title
  title: messages.events,

  // Create the data object
  dataParser: (
    responseData,
    formatMessage: WrappedComponentProps['intl']['formatMessage']
  ): StatCardChartData => {
    // Upcoming is not available if 3 stat arrays are not returned
    let total;
    let upcoming;
    let completed;
    if (responseData.length === 3) {
      [total, upcoming, completed] = responseData;
    } else {
      [total, completed] = responseData;
    }

    const cardData: StatCardChartData = {
      cardTitle: formatMessage(messages.events),
      fileName: formatMessage(messages.events).toLowerCase().replace(' ', '_'),
      stats: [],
    };
    cardData.stats.push({
      label: formatMessage(messages.totalEvents),
      value: formatCountValue(total[0].count),
    });
    upcoming &&
      cardData.stats.push({
        label: formatMessage(messages.upcoming),
        value: formatCountValue(upcoming[0].count),
      });
    cardData.stats.push({
      label: formatMessage(messages.completed),
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
    // const todayMoment = moment();

    const queryBase = (
      startMoment: Moment | null | undefined,
      endMoment: Moment | null,
      dateType: 'start' | 'end' = 'start',
      pending = false
    ): QuerySchema => {
      const notCompleteFilter = pending ? { dimension_date_end_id: null } : {};

      const querySchema: QuerySchema = {
        fact: 'event',
        aggregations: {
          all: 'count',
        },
      };

      const filters = {
        ...notCompleteFilter,
        ...getDateFilter(`dimension_date_${dateType}`, startMoment, endMoment),
        ...getProjectFilter('dimension_project', projectId),
      };
      if (Object.keys(filters).length !== 0) {
        querySchema.filters = filters;
      }

      return querySchema;
    };

    const queryTotal: QuerySchema = queryBase(startAtMoment, endAtMoment);
    const queryUpcoming: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'start',
      true
    );
    const queryCompleted: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'end'
    );

    // Remove the upcoming query if there are start and end date filters
    let returnQuery = [queryTotal, queryUpcoming, queryCompleted];
    if (startAtMoment && endAtMoment) {
      returnQuery = [queryTotal, queryCompleted];
    }
    console.log(JSON.stringify({ query: returnQuery }));
    return {
      query: returnQuery,
    };
  },
};
