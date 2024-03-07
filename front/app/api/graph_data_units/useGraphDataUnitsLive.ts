import { useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';

import graphDataUnitKeys from './keys';
import { ParametersLive, Options } from './requestTypes';

const fetchGraphDataUnitsLive = <Response extends BaseResponseData>({
  resolved_name,
  props,
}: ParametersLive) => {
  return fetcher<Response>({
    path: `/reports/graph_data_units/live`,
    action: 'get',
    queryParams: {
      resolved_name,
      props: {
        ...props,
        start_at: (props as any).startAtMoment?.format('yyyy-MM-DD'),
        end_at: (props as any).endAtMoment?.format('yyyy-MM-DD'),
      },
    },
  });
};

const useGraphDataUnitsLive = <Response extends BaseResponseData>(
  parameters: ParametersLive,
  { enabled = true, onSuccess }: Options = { enabled: true }
) => {
  const queryClient = useQueryClient();
  const stringifiedQuery = JSON.stringify(parameters);

  // Call onSuccess if the query is already in the cache
  useEffect(() => {
    const parsedQuery = JSON.parse(stringifiedQuery);
    const queryKey = graphDataUnitKeys.item(parsedQuery);
    if (queryClient.getQueryData(queryKey)) {
      onSuccess && onSuccess();
    }
  }, [stringifiedQuery, queryClient, onSuccess]);

  return useQuery<Response, CLErrors, Response, any>({
    queryKey: graphDataUnitKeys.item(parameters),
    queryFn: () => fetchGraphDataUnitsLive<Response>(parameters),
    enabled,
    onSuccess,
  });
};

export default useGraphDataUnitsLive;
