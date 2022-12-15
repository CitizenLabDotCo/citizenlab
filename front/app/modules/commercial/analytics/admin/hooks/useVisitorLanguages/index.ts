import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// parse
import { parsePieData, parseExcelData } from './parse';

// typings
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Response, PieRow, QueryParameters } from './typings';

// utils
import { getProjectFilter, getDateFilter } from '../../utils/query';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const localesCountQuery: QuerySchema = {
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
    groups: 'dimension_locales.id',
    aggregations: {
      visitor_id: 'count',
      'dimension_locales.name': 'first',
    },
  };

  return {
    query: localesCountQuery,
  };
};

export default function useVisitorsData({
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
          setXlsxData(response);
          return;
        }
        const translations = getTranslations(formatMessage);
        setXlsxData(parseExcelData(response.data, translations));
        setPieData(parsePieData(response.data));
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, formatMessage]);

  return { pieData, xlsxData };
}
