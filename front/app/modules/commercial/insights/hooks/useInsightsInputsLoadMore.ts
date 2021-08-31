import { useState, useEffect } from 'react';
import {
  insightsInputsStream,
  IInsightsInputData,
} from '../services/insightsInputs';
import { isNilOrError } from 'utils/helperUtils';
import { unionBy } from 'lodash-es';

const defaultPageSize = 20;

export type QueryParameters = {
  category: string;
  search: string;
};

const useInsightsInputsLoadMore = (
  viewId: string,
  queryParameters?: Partial<QueryParameters>
) => {
  const [insightsInputs, setInsightsInputs] = useState<
    IInsightsInputData[] | undefined | null | Error
  >(undefined);
  const [hasMore, setHasMore] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState(1);

  const category = queryParameters?.category;
  const search = queryParameters?.search;

  // Reset page number on search and category change
  useEffect(() => {
    setPageNumber(1);
  }, [category, search]);

  useEffect(() => {
    setLoading(true);
    const subscription = insightsInputsStream(viewId, {
      queryParameters: {
        category,
        search,
        'page[number]': pageNumber || 1,
        'page[size]': defaultPageSize,
      },
    }).observable.subscribe((insightsInputs) => {
      setInsightsInputs((prevInsightsInputs) =>
        !isNilOrError(prevInsightsInputs) && pageNumber !== 1
          ? unionBy(prevInsightsInputs, insightsInputs.data, 'id')
          : insightsInputs.data
      );
      setHasMore(!isNilOrError(insightsInputs.links?.next));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [viewId, pageNumber, category, search]);

  const onLoadMore = () => {
    setPageNumber(pageNumber + 1);
  };

  return {
    hasMore,
    loading,
    onLoadMore,
    list: insightsInputs,
  };
};

export default useInsightsInputsLoadMore;
