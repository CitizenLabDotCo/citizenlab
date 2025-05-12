import moment, { Moment } from 'moment';

import { Query, QuerySchema } from 'api/analytics/types';

import { formatCountValue } from 'components/admin/GraphCards/_utils/parse';
import { getDateFilter } from 'components/admin/GraphCards/_utils/query';
import { getTimePeriodMoment } from 'components/admin/GraphCards/_utils/resolution';

import { underscoreCase } from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/parse';
import {
  StatCardData,
  StatCardProps,
  StatCardConfig,
} from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/typings';

import messages from './messages';

// Type helps to keep this file and tests type safe although useStatCard returns a more generic object
export interface InvitationsCardLabels {
  invitations: string;
  periodLabel: string;
  totalInvites: string;
  pending: string;
  accepted: string;
}

export const invitationsConfig: StatCardConfig = {
  // Pass in the messages object
  messages,

  // Card title
  title: messages.invitations,

  // Create the data object
  dataParser: (
    responseData,
    labels: InvitationsCardLabels,
    projectId
  ): StatCardData => {
    // Cannot filter by project ID on invitations, so set all responses to zero
    if (projectId) {
      // eslint-disable-next-line no-param-reassign
      responseData = responseData.map(() => {
        return [{ count: 0 }];
      });
    }

    // Pending stat is not available if 5 stat arrays are not returned
    let total;
    let totalPeriod;
    let pending;
    let accepted;
    let acceptedPeriod;
    if (responseData.length === 5) {
      [total, totalPeriod, pending, accepted, acceptedPeriod] = responseData;
    } else {
      [total, totalPeriod, accepted, acceptedPeriod] = responseData;
    }

    const cardData: StatCardData = {
      cardTitle: labels.invitations,
      fileName: underscoreCase(labels.invitations),
      periodLabel: labels.periodLabel,
      stats: [],
    };
    cardData.stats.push({
      label: labels.totalInvites,
      value: formatCountValue(total[0].count),
      lastPeriod: formatCountValue(totalPeriod[0].count),
    });
    pending &&
      cardData.stats.push({
        label: labels.pending,
        value: formatCountValue(pending[0].count),
      });
    cardData.stats.push({
      label: labels.accepted,
      value: formatCountValue(accepted[0].count),
      lastPeriod: formatCountValue(acceptedPeriod[0].count),
    });

    return cardData;
  },

  // Analytics API query
  queryHandler: ({
    // projectId,
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
      const inviteStatusFilter =
        inviteStatus === null
          ? {}
          : { 'dimension_user.invite_status': inviteStatus };

      return {
        fact: 'registration',
        aggregations: {
          all: 'count',
        },
        filters: {
          ...inviteStatusFilter,
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

    // Don't return the pending query if there are start and end date filters
    if (startAtMoment && endAtMoment) {
      return {
        query: [
          queryTotal,
          queryTotalLastPeriod,
          queryAccepted,
          queryAcceptedLastPeriod,
        ],
      };
    }
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
};
