import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// parse
import { parsePieData, parseExcelData } from './parse';

// utils
import { getProjectFilter, getDateFilter } from '../../utils/query';
import { getTranslations } from './utils';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { QueryParameters, Response, PieRow } from './typings';
import { InjectedIntlProps } from 'react-intl';
import { XlsxData } from 'components/admin/ReportExportMenu';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const trafficSourcesQuery: QuerySchema = {
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
    groups: 'dimension_referrer_type.id',
    aggregations: {
      all: 'count',
      'dimension_referrer_type.name': 'first',
    },
  };

  return { query: trafficSourcesQuery };
};

export default function useVisitorTrafficSources(
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
