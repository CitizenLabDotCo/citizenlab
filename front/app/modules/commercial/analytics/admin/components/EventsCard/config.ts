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
    const queryBase = (
      startMoment: Moment | null | undefined,
      endMoment: Moment | null,
      dateType: 'start' | 'end' = 'start'
    ): QuerySchema => {
      const querySchema: QuerySchema = {
        fact: 'event',
        aggregations: {
          all: 'count',
        },
        filters: {},
      };

      // TODO: Need fresh eyes on this - cannot get filters working with current types
      const dateFilter = getDateFilter(
        `dimension_date_${dateType}`,
        startMoment,
        endMoment
      );
      const projectFilter = getProjectFilter('dimension_project', projectId);
      console.log(dateFilter, projectFilter, dateType);
      //
      // console.log(startMoment, endMoment, dateType);
      //
      // (startMoment && endMoment) &&
      //   querySchema.filters = { ...dateFilter };
      //
      //   console.log('date');
      // //   querySchema.filters = {
      // //   ...dateFilter,
      // //   ...projectFilter,
      // //   };
      // }

      return querySchema;
    };

    const queryTotal: QuerySchema = queryBase(startAtMoment, endAtMoment);
    const queryUpcoming: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'start'
    );
    const queryCompleted: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'end'
    );

    // Remove the upcoming query if there are start and end date filters
    let returnQuery = [queryTotal, queryUpcoming, queryCompleted];
    if (startAtMoment && endAtMoment)
      returnQuery = [queryTotal, queryCompleted];
    return {
      query: returnQuery,
    };
  },
};
