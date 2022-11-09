import messages from './messages';

// Utils
import { getTimePeriodTranslationByResolution } from '../../utils/resolution';
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
    formatMessage: WrappedComponentProps['intl']['formatMessage'],
    resolution
  ): StatCardChartData => {
    const [total, upcoming, completed] = responseData;
    return {
      cardTitle: formatMessage(messages.events),
      fileName: formatMessage(messages.events).toLowerCase().replace(' ', '_'),
      periodLabel: getTimePeriodTranslationByResolution(
        formatMessage,
        resolution
      ),
      stats: [
        {
          label: formatMessage(messages.totalEvents),
          value: formatCountValue(total[0].count),
        },
        {
          label: formatMessage(messages.upcoming),
          value: formatCountValue(upcoming[0].count),
        },
        {
          label: formatMessage(messages.completed),
          value: formatCountValue(completed[0].count),
        },
      ],
    };
  },

  // Analytics API query
  queryHandler: ({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  }: StatCardProps): Query => {
    console.log(resolution); // Needs to work without resolution too
    const queryBase = (
      startMoment: Moment | null | undefined,
      endMoment: Moment | null,
      inviteStatus: 'pending' | 'accepted' | null = null
    ): QuerySchema => {
      const dateDimension =
        inviteStatus === 'accepted'
          ? 'dimension_date_accepted'
          : 'dimension_date_invited';

      const inviteStatusFilter = () => {
        if (inviteStatus === null) {
          return {};
        }
        return { 'dimension_user.invite_status': inviteStatus };
      };

      // upcoming is dimension_date_start after today
      // completed is dimension_date_end after today

      return {
        fact: 'event',
        aggregations: {
          all: 'count',
        },
        filters: {
          ...inviteStatusFilter,
          ...getProjectFilter('dimension_project', projectId),
          ...getDateFilter('dimension_date_start', startMoment, endMoment),
        },
      };
    };

    const queryTotal: QuerySchema = queryBase(startAtMoment, endAtMoment);
    const queryUpcoming: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'pending'
    );
    const queryCompleted: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'accepted'
    );

    return {
      query: [queryTotal, queryUpcoming, queryCompleted],
    };
  },
};
