import { useEffect, useState } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// parse
import { parseExcelData, parsePieData } from './parse';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { getDateFilter, getProjectFilter } from '../../utils/query';
import { getTranslations } from './utils';

// typings
import { XlsxData } from 'components/admin/ReportExportMenu';
import { WrappedComponentProps } from 'react-intl';
import { PieRow, QueryParameters, Response } from './typings';

const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  const trafficSourcesQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter('dimension_date_last_action', startAt, endAt),
    },
    groups: 'dimension_referrer_type.id',
    aggregations: {
      all: 'count',
      'dimension_referrer_type.name': 'first',
    },
  };

  return { query: trafficSourcesQuery };
};

export default function useVisitorsTrafficSourcesData(
  formatMessage: WrappedComponentProps['intl']['formatMessage'],
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
