import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { getProjectFilter, getDateFilter } from '../../utils/query';
import moment, { Moment } from 'moment';
import { parseInvitationsChartData, parseInvitationsExcelData } from './parse';
import { useIntl } from 'utils/cl-intl';
import { getTimePeriodMoment } from '../../utils/resolution';
import { getInvitationsLabels } from './utils';

// typings
import { Invitations } from './typings';
import { StatCardPeriodProps, SingleCountResponse } from '../../typings';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardPeriodProps): Query => {
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
};

export default function useInvitations({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardPeriodProps) {
  const [invitations, setInvitations] = useState<Invitations | NilOrError>(
    undefined
  );
  const { formatMessage } = useIntl();
  useEffect(() => {
    const { observable } = analyticsStream<SingleCountResponse>(
      query({ projectId, startAtMoment, endAtMoment, resolution })
    );
    const subscription = observable.subscribe(
      (response: SingleCountResponse | NilOrError) => {
        if (isNilOrError(response)) {
          setInvitations(response);
          return;
        }

        const [total, totalPeriod, pending, accepted, acceptedPeriod] =
          response.data;
        const chartData = parseInvitationsChartData(
          total,
          totalPeriod,
          pending,
          accepted,
          acceptedPeriod
        );

        const labels = getInvitationsLabels(formatMessage, resolution);
        const xlsxData = parseInvitationsExcelData(
          total,
          totalPeriod,
          pending,
          accepted,
          acceptedPeriod,
          labels
        );

        setInvitations({
          chartData,
          xlsxData,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, formatMessage, resolution]);

  return invitations;
}
