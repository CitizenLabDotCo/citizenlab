import { useState, useEffect } from 'react';
// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';
// utils
import { getProjectFilter, getDateFilter } from '../../utils/query';
// i18n
import { useIntl } from 'utils/cl-intl';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { XlsxData } from 'components/admin/ReportExportMenu';
// parse
import { parsePieData, parseExcelData } from './parse';
import { getTranslations } from './translations';
// typings
import { QueryParameters, Response, PieRow } from './typings';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const trafficSourcesQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter(
        'dimension_date_last_action',
        startAtMoment,
        endAtMoment
      ),
    },
    groups: 'dimension_referrer_type.id',
    aggregations: {
      all: 'count',
      'dimension_referrer_type.name': 'first',
    },
  };

  return { query: trafficSourcesQuery };
};

export default function useVisitorsReferrerTypes({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [pieData, setPieData] = useState<PieRow[] | NilOrError>();
  const [xlsxData, setXlsxData] = useState<XlsxData | NilOrError>();

  useEffect(() => {
    const observable = analyticsStream<Response>(
      query({
        projectId,
        startAtMoment,
        endAtMoment,
      })
    ).observable;

    const subscription = observable.subscribe(
      (response: Response | NilOrError) => {
        if (isNilOrError(response)) {
          setPieData(response);
          return;
        }

        const translations = getTranslations(formatMessage);

        const pieData = parsePieData(response.data, translations);
        setPieData(pieData);

        setXlsxData(parseExcelData(pieData, translations));
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, formatMessage]);

  return { pieData, xlsxData };
}
