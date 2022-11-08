import { useEffect, useState } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { parseExcelData } from './parse';
import { useIntl } from 'utils/cl-intl';

// typings
import {
  SingleCountResponse,
  StatCardData,
  StatCardQueryParameters,
} from './typings';

export default function useStatCard({
  query,
  parseChartData,
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardQueryParameters) {
  const [statCard, setStatCard] = useState<StatCardData | NilOrError>(
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
          setStatCard(response);
          return;
        }
        const chartData = parseChartData(
          response.data,
          formatMessage,
          resolution
        );
        const xlsxData = parseExcelData(chartData);

        setStatCard({
          chartData,
          xlsxData,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [parseChartData, formatMessage, resolution]);

  return statCard;
}
