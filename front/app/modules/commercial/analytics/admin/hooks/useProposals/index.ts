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
import { parseProposalsChartData, parseProposalsExcelData } from './parse';
import { useIntl } from 'utils/cl-intl';
import { getTimePeriodMoment } from '../../utils/resolution';
import { getProposalsLabels } from './utils';

// typings
import { Proposals } from './typings';
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
    successful = false
  ): QuerySchema => {
    const successStatus = () => {
      return successful ? { 'dimension_status.code': 'threshold_reached' } : {};
    };
    return {
      fact: 'post',
      aggregations: {
        all: 'count',
      },
      filters: {
        'dimension_type.name': 'initiative',
        ...successStatus,
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

export default function useProposals({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardPeriodProps) {
  const [proposals, setProposals] = useState<Proposals | NilOrError>(undefined);
  const { formatMessage } = useIntl();
  useEffect(() => {
    const { observable } = analyticsStream<SingleCountResponse>(
      query({ projectId, startAtMoment, endAtMoment, resolution })
    );
    const subscription = observable.subscribe(
      (response: SingleCountResponse | NilOrError) => {
        if (isNilOrError(response)) {
          setProposals(response);
          return;
        }

        const [all, allPeriod, successful, successfulPeriod] = response.data;
        const chartData = parseProposalsChartData(
          all,
          allPeriod,
          successful,
          successfulPeriod
        );

        const labels = getProposalsLabels(formatMessage, resolution);
        const xlsxData = parseProposalsExcelData(
          all,
          allPeriod,
          successful,
          successfulPeriod,
          labels
        );

        setProposals({
          chartData,
          xlsxData,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, formatMessage, resolution]);

  return proposals;
}
