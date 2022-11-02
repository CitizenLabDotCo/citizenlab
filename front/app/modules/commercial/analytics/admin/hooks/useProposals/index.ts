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
import moment from 'moment';
import { parseChartData, parseExcelData } from './parse';
import { useIntl } from 'utils/cl-intl';
import { getLabels } from './utils';

// typings
import { QueryParameters, Proposals, Response } from './typings';
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

// TODO: This is duplicated from elsewhere - but removed the formatting & simplified
const getLastPeriodMoment = (resolution: IResolution) => {
  let days = 1;
  if (resolution === 'month') days = 30;
  if (resolution === 'week') days = 7;
  return moment().subtract({ days });
};

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const todayMoment = moment();
  const lastPeriodMoment = getLastPeriodMoment(resolution);

  const queryBase = (
    startMoment: Moment | null | undefined,
    endMoment: Moment | null | undefined,
    accepted = false
  ): QuerySchema => {
    const acceptedStatus = () => {
      return accepted ? { dimension_status: { code: 'accepted' } } : {};
    };
    return {
      fact: 'post',
      aggregations: {
        all: 'count',
      },
      filters: {
        dimension_type: { name: 'initiative' },
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

export default function useProposals({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [proposals, setProposals] = useState<Proposals | NilOrError>(undefined);
  const { formatMessage } = useIntl();
  useEffect(() => {
    const { observable } = analyticsStream<Response>(
      query({ projectId, startAtMoment, endAtMoment, resolution })
    );
    const subscription = observable.subscribe(
      (response: Response | NilOrError) => {
        // TODO: Don't think we need to catch an empty response here?
        if (isNilOrError(response)) {
          setProposals(response);
          return;
        }

        const [all, allPeriod, successful, successfulPeriod] = response.data;
        const chartData = parseChartData(
          all,
          allPeriod,
          successful,
          successfulPeriod
        );

        const labels = getLabels(formatMessage, resolution);
        const xlsxData = parseExcelData(
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
  }, [projectId, startAtMoment, endAtMoment]);

  return proposals;
}
