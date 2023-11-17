import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { Response } from './typings';
import { useNode } from '@craftjs/core';
import { useParams } from 'react-router-dom';
import { QueryKeys } from 'utils/cl-react-query/types';

export interface PublishedDataQueryParameters {
  reportId?: string;
  graphId: string;
}

const baseKey = { type: 'report_builder_published_data_units' };

const publishedReactionsByTimeKeys = {
  all: () => [baseKey],
  item: (params: PublishedDataQueryParameters) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

const fetchReactionsByTime = ({
  reportId,
  graphId,
}: PublishedDataQueryParameters) =>
  fetcher<Response>({
    path: `/reports/graph_data_units/published`,
    action: 'get',
    queryParams: {
      report_id: reportId,
      graph_id: graphId,
    },
  });

const usePublishedReactionsByTime = () => {
  const { id: graphId } = useNode();
  const { reportId } = useParams<{ reportId: string }>();

  return useQuery<Response, CLErrors, Response, any>({
    queryKey: publishedReactionsByTimeKeys.item({ reportId, graphId }),
    queryFn: () => fetchReactionsByTime({ reportId, graphId }),
  });
};

export default usePublishedReactionsByTime;
