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
  queryHandler,
  dataParser,
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
      queryHandler({ projectId, startAtMoment, endAtMoment, resolution })
    );
    const subscription = observable.subscribe(
      (response: SingleCountResponse | NilOrError) => {
        if (isNilOrError(response)) {
          setStatCard(response);
          return;
        }
        const chartData = dataParser(response.data, formatMessage, resolution);
        const xlsxData = parseExcelData(chartData);

        setStatCard({
          cardData: chartData,
          xlsxData,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [
    dataParser,
    queryHandler,
    projectId,
    startAtMoment,
    endAtMoment,
    formatMessage,
    resolution,
  ]);

  return statCard;
}
