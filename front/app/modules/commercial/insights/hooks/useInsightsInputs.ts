import { useState, useEffect } from 'react';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import {
  insightsInputsStream,
  IInsightsInputData,
} from '../services/insightsInputs';

const defaultPageSize = 20;

type QueryParameters = {
  category: string;
  pageSize: number;
  pageNumber: number;
  search: string;
  sort?: 'approval' | '-approval';
};

export interface IUseInpightsInputsOutput {
  list: IInsightsInputData[] | undefined | null;
  loading: boolean;
  onChangePage: (pageNumber: number) => void;
  currentPage: number;
}

const useInsightsInputs = (
  viewId: string,
  queryParameters?: Partial<QueryParameters>
) => {
  const [insightsInputs, setInsightsInputs] = useState<
    IInsightsInputData[] | undefined | null | Error
  >(undefined);

  const pageNumber = queryParameters?.pageNumber;
  const category = queryParameters?.category;
  const search = queryParameters?.search;
  const sort = queryParameters?.sort || 'approval';

  const [lastPage, setLastPage] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const subscription = insightsInputsStream(viewId, {
      queryParameters: {
        category,
        search,
        sort,
        'page[number]': queryParameters?.pageNumber || 1,
        'page[size]': queryParameters?.pageSize || defaultPageSize,
      },
    }).observable.subscribe((insightsInputs) => {
      setInsightsInputs(insightsInputs.data);
      setLastPage(getPageNumberFromUrl(insightsInputs.links?.last));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [viewId, pageNumber, category, search, sort]);

  return {
    lastPage,
    loading,
    list: insightsInputs,
  };
};

export default useInsightsInputs;
