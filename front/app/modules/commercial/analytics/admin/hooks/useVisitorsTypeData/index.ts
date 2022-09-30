import { useState, useEffect } from 'react';

// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// parse
import { parsePieData } from './parse';

// typings
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Response, PieRow } from './typings';

const query = (): Query => {
  const localesCountQuery: QuerySchema = {
    fact: 'visit',
    groups: 'dimension_user.id',
    aggregations: {
      'dimension_date_first_action.date': 'first',
      'dimension_date_last_action.date': 'first',
    },
  };

  return {
    query: localesCountQuery,
  };
};

export default function useVisitorsData() {
  const [pieData, setPieData] = useState<PieRow[] | NilOrError>();
  const [xlsxData, setXlsxData] = useState<XlsxData | NilOrError>();

  useEffect(() => {
    const observable = analyticsStream<Response>(query()).observable;

    const subscription = observable.subscribe(
      (response: Response | NilOrError) => {
        if (isNilOrError(response)) {
          setPieData(response);
          setXlsxData(response);
          return;
        }

        setPieData(parsePieData(response.data));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { pieData, xlsxData };
}
