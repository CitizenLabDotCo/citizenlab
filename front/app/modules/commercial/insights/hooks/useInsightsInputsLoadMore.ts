import { unionBy } from 'lodash-es';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';
import { useEffect, useState } from 'react';
import { trackEventByName } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';
import {
  IInsightsInputData,
  insightsInputsStream,
} from '../services/insightsInputs';

const defaultPageSize = 20;

export type QueryParameters = {
  search: string;
  categories: string[];
  keywords: string[];
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

  const search = queryParameters?.search;

  // Stringifying the keywords and categories array to avoid non-primary values in the useEffect dependencies
  const categories = JSON.stringify({
    categories: queryParameters?.categories,
  });
  const keywords = JSON.stringify({ keywords: queryParameters?.keywords });

  // Reset page number on search and category change
  useEffect(() => {
    setPageNumber(1);
  }, [search, categories, keywords]);

  useEffect(() => {
    setLoading(true);
    const subscription = insightsInputsStream(viewId, {
      queryParameters: {
        search,
        ...JSON.parse(categories),
        ...JSON.parse(keywords),
        'page[number]': pageNumber || 1,
        'page[size]': defaultPageSize,
      },
    }).observable.subscribe((insightsInputs) => {
      if (isNilOrError(insightsInputs)) {
        setInsightsInputs(insightsInputs);
        setHasMore(false);
      } else {
        setHasMore(!isNilOrError(insightsInputs.links?.next));
        setInsightsInputs((prevInsightsInputs) =>
          !isNilOrError(prevInsightsInputs) && pageNumber !== 1
            ? unionBy(prevInsightsInputs, insightsInputs.data, 'id')
            : insightsInputs.data
        );
      }
      setLoading(false);

      trackEventByName(tracks.applyFilters, {
        ...JSON.parse(categories),
        ...JSON.parse(keywords),
        search,
      });
    });

    return () => subscription.unsubscribe();
  }, [viewId, pageNumber, search, categories, keywords]);

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
