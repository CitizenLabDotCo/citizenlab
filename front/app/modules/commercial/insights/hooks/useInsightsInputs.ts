import { useState, useEffect } from 'react';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import {
  insightsInputsStream,
  IInsightsInputData,
} from '../services/insightsInputs';

const defaultPageSize = 20;

export type QueryParameters = {
  category: string;
  pageSize: number;
  pageNumber: number;
  search: string;
  processed: boolean;
  sort: 'approval' | '-approval';
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
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const pageNumber = queryParameters?.pageNumber;
  const pageSize = queryParameters?.pageSize;
  const category = queryParameters?.category;
  const search = queryParameters?.search;
  const sort = queryParameters?.sort;
  const processed = queryParameters?.processed;

  useEffect(() => {
    setLoading(true);
    const subscription = insightsInputsStream(viewId, {
      queryParameters: {
        category,
        search,
        processed,
        sort: queryParameters?.sort || 'approval',
        'page[number]': queryParameters?.pageNumber || 1,
        'page[size]': queryParameters?.pageSize || defaultPageSize,
      },
    }).observable.subscribe((insightsInputs) => {
      setInsightsInputs(insightsInputs.data);
      setLastPage(getPageNumberFromUrl(insightsInputs.links?.last));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [viewId, pageNumber, category, search, sort, pageSize, processed]);

  return {
    lastPage,
    loading,
    list: insightsInputs,
  };
};

export default useInsightsInputs;
