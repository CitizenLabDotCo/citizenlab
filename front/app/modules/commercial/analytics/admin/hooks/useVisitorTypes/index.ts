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
  const visitorTypesCountQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter(
        'dimension_date_last_action',
        startAtMoment,
        endAtMoment
      ),
    },
    groups: 'returning_visitor',
    aggregations: {
      visitor_id: 'count',
    },
  };

  return {
    query: visitorTypesCountQuery,
  };
};

export default function useVisitorTypes(
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

        const pieData = parsePieData(response.data, translations);
        setPieData(pieData);

        setXlsxData(parseExcelData(pieData, translations));
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, formatMessage]);

  return { pieData, xlsxData };
}
