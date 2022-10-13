import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// parse
import { parsePieData, parseExcelData } from './parse';

// typings
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Response, PieRow, QueryParameters } from './typings';
import { InjectedIntlProps } from 'react-intl';

// utils
import { getProjectFilter, getDateFilter } from '../../utils/query';
import { getTranslations } from './utils';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  const localesCountQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter('dimension_date_last_action', startAt, endAt),
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

export default function useVisitorLanguages(
  formatMessage: InjectedIntlProps['intl']['formatMessage'],
  { projectId, startAtMoment, endAtMoment }: QueryParameters
) {
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
