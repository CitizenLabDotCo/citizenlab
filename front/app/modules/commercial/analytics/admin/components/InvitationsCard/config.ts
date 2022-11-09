import messages from './messages';

// Utils
import {
  getTimePeriodMoment,
  getTimePeriodTranslationByResolution,
} from '../../utils/resolution';
import { formatCountValue } from '../../utils/parse';
import { getDateFilter, getProjectFilter } from '../../utils/query';

// Typings
import {
  StatCardChartData,
  StatCardProps,
  StatCardConfig,
} from '../../hooks/useStatCard/typings';
import { Query, QuerySchema } from '../../services/analyticsFacts';
import moment, { Moment } from 'moment';
import { WrappedComponentProps } from 'react-intl';

export const invitationsConfig: StatCardConfig = {
  // Create the data object
  dataParser: (
    responseData,
    formatMessage: WrappedComponentProps['intl']['formatMessage'],
    resolution
  ): StatCardChartData => {
    const [total, totalPeriod, pending, accepted, acceptedPeriod] =
      responseData;
    return {
      cardTitle: formatMessage(messages.invitations),
      fileName: formatMessage(messages.invitations)
        .toLowerCase()
        .replace(' ', '_'),
      periodLabel: getTimePeriodTranslationByResolution(
        formatMessage,
        resolution
      ),
      stats: [
        {
          label: formatMessage(messages.totalInvites),
          value: formatCountValue(total[0].count),
          lastPeriod: formatCountValue(totalPeriod[0].count),
        },
        {
          label: formatMessage(messages.pending),
          value: formatCountValue(pending[0].count),
        },
        {
          label: formatMessage(messages.accepted),
          value: formatCountValue(accepted[0].count),
          lastPeriod: formatCountValue(acceptedPeriod[0].count),
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
    const todayMoment = moment();
    const lastPeriodMoment = getTimePeriodMoment(resolution);

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

      return {
        fact: 'registration',
        aggregations: {
          all: 'count',
        },
        filters: {
          ...inviteStatusFilter,
          ...getProjectFilter('dimension_project', projectId),
          ...getDateFilter(dateDimension, startMoment, endMoment),
        },
      };
    };

    const queryTotal: QuerySchema = queryBase(startAtMoment, endAtMoment);
    const queryTotalLastPeriod: QuerySchema = queryBase(
      lastPeriodMoment,
      todayMoment
    );
    const queryPending: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'pending'
    );
    const queryAccepted: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      'accepted'
    );
    const queryAcceptedLastPeriod: QuerySchema = queryBase(
      lastPeriodMoment,
      todayMoment,
      'accepted'
    );

    return {
      query: [
        queryTotal,
        queryTotalLastPeriod,
        queryPending,
        queryAccepted,
        queryAcceptedLastPeriod,
      ],
    };
  },

  // Function only used when there is no data
  titleGetter: (
    formatMessage: WrappedComponentProps['intl']['formatMessage']
  ): string => {
    return formatMessage(messages.invitations);
  },
};
