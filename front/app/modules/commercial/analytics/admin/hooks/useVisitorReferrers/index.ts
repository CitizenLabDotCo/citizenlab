import { useState, useEffect } from 'react';

// services
import { analyticsStream } from '../../services/analyticsFacts';

// i18n
import { useIntl } from 'utils/cl-intl';

// parse
import { parseTableData } from './parse';

// utils
import { referrersListQuery, referrersTotalQuery } from './query';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import {
  QueryParameters,
  ReferrerListResponse,
  ReferrerTotalsResponse,
  ReferrersTotalRow,
  TableRow,
} from './typings';

export default function useVisitorReferrers({
  projectId,
  startAtMoment,
  endAtMoment,
  pageNumber,
  pageSize,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [tableData, setTableData] = useState<TableRow[] | NilOrError>();
  const [totals, setTotals] = useState<ReferrersTotalRow | NilOrError>();

  useEffect(() => {
    if (isNilOrError(totals)) return;

    const observable = analyticsStream<ReferrerListResponse>(
      referrersListQuery({
        projectId,
        startAtMoment,
        endAtMoment,
        pageNumber,
        pageSize,
      })
    ).observable;

    const subscription = observable.subscribe(
      (response: ReferrerListResponse | NilOrError) => {
        if (isNilOrError(response)) {
          setTableData(response);
          return;
        }

        setTableData(parseTableData(response.data, totals, formatMessage));
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment, pageNumber, pageSize, totals]);

  useEffect(() => {
    setTotals(undefined);

    const observable = analyticsStream<ReferrerTotalsResponse>(
      referrersTotalQuery({
        projectId,
        startAtMoment,
        endAtMoment,
      })
    ).observable;

    const subscription = observable.subscribe(
      (response: ReferrerTotalsResponse | NilOrError) => {
        if (isNilOrError(response)) {
          setTotals(response);
          return;
        }

        setTotals(response.data[0]);
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, startAtMoment, endAtMoment]);

  return { tableData };
}
