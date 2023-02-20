import { useState, useEffect } from 'react';

// services
import { analyticsStream } from 'services/analyticsFacts';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// query
import { query } from './query';

// parse
import { parseTimeSeries, parseExcelData } from './parse';

// utils
import { getFormattedNumbers } from 'components/admin/GraphCards/_utils/parse';

// typings
import { QueryParameters, Response, TimeSeries } from './typings';
import { FormattedNumbers } from 'components/admin/GraphCards/typings';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { IResolution } from 'components/admin/ResolutionControl';
import { XlsxData } from 'components/admin/ReportExportMenu';

export default function usePostsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();

  const [timeSeries, setTimeSeries] = useState<TimeSeries | NilOrError>();
  const [xlsxData, setXlsxData] = useState<XlsxData | NilOrError>();
  const [formattedNumbers, setFormattedNumbers] = useState<FormattedNumbers>({
    totalNumber: null,
    formattedSerieChange: null,
    typeOfChange: '',
  });

  const [currentResolution, setCurrentResolution] =
    useState<IResolution>(resolution);

  useEffect(() => {
    const observable = analyticsStream<Response>(
      query({
        projectId,
        startAtMoment,
        endAtMoment,
        resolution,
      })
    ).observable;

    const subscription = observable.subscribe(
      (response: Response | NilOrError) => {
        if (isNilOrError(response)) {
          setTimeSeries(response);
          setXlsxData(response);
          setFormattedNumbers({
            totalNumber: null,
            formattedSerieChange: null,
            typeOfChange: null,
          });
          return;
        }

        const translations = getTranslations(formatMessage);

        setCurrentResolution(resolution);

        const timeSeries = parseTimeSeries(
          response.data[0],
          startAtMoment,
          endAtMoment,
          resolution,
          response.data[1]
        );
        setTimeSeries(timeSeries);

        setXlsxData(parseExcelData(timeSeries, translations));

        const firstSerieBar =
          timeSeries && timeSeries.length > 0 ? timeSeries[0].inputs : 0;
        setFormattedNumbers(getFormattedNumbers(timeSeries, firstSerieBar));
      }
    );

    return () => subscription.unsubscribe();
  }, [startAtMoment, endAtMoment, resolution, formatMessage, projectId]);

  return { currentResolution, timeSeries, xlsxData, formattedNumbers };
}
