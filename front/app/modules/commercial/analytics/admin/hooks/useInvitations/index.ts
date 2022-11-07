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
    accepted = false
  ): QuerySchema => {
    const acceptedStatus = () => {
      return accepted ? { 'dimension_status.code': 'accepted' } : {};
    };
    return {
      fact: 'post',
      aggregations: {
        all: 'count',
      },
      filters: {
        'dimension_type.name': 'initiative',
        ...acceptedStatus,
        ...getProjectFilter('dimension_project', projectId),
        ...getDateFilter('dimension_date_created', startMoment, endMoment),
      },
    };
  };

  const queryAll: QuerySchema = queryBase(startAtMoment, endAtMoment);
  const queryAllLastPeriod: QuerySchema = queryBase(
    lastPeriodMoment,
    todayMoment
  );
  const querySuccessful: QuerySchema = queryBase(
    startAtMoment,
    endAtMoment,
    true
  );
  const querySuccessfulLastPeriod: QuerySchema = queryBase(
    lastPeriodMoment,
    todayMoment,
    true
  );

  return {
    query: [
      queryAll,
      queryAllLastPeriod,
      querySuccessful,
      querySuccessfulLastPeriod,
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

        const [all, allPeriod, successful, successfulPeriod] = response.data;
        const chartData = parseInvitationsChartData(
          all,
          allPeriod,
          successful,
          successfulPeriod
        );

        const labels = getInvitationsLabels(formatMessage, resolution);
        const xlsxData = parseInvitationsExcelData(
          all,
          allPeriod,
          successful,
          successfulPeriod,
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
