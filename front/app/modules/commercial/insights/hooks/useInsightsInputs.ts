import { useState, useEffect } from 'react';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import {
  insightsInputsStream,
  IInsightsInputData,
} from '../services/insightsInputs';
import { isNilOrError } from 'utils/helperUtils';

export const defaultPageSize = 20;

export type QueryParameters = {
  category: string;
  pageSize: number;
  pageNumber: number;
  search: string;
  processed: boolean;
  sort?: 'approval' | '-approval';
};

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
        search,
        processed,
        categories: typeof category === 'string' ? [category] : undefined,
        sort,
        'page[number]': pageNumber || 1,
        'page[size]': pageSize || defaultPageSize,
      },
    }).observable.subscribe((insightsInputs) => {
      if (isNilOrError(insightsInputs)) {
        setInsightsInputs(insightsInputs);
      } else {
        setLastPage(getPageNumberFromUrl(insightsInputs.links?.last));
        setInsightsInputs(insightsInputs.data);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [viewId, pageNumber, category, search, sort, pageSize, processed]);

  return {
    lastPage,
    loading,
    setLoading,
    list: insightsInputs,
  };
};

export default useInsightsInputs;
