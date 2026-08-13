import { useEffect, useRef } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';

import graphDataUnitKeys from './keys';
import { ParametersLive, Options } from './requestTypes';

const fetchGraphDataUnitsLive = <Response extends BaseResponseData>(
  queryParams: ParametersLive
) => {
  return fetcher<Response>({
    path: `/reports/graph_data_units/live`,
    action: 'get',
    queryParams,
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

  const result = useQuery<Response, CLErrors, Response, any>({
    queryKey: graphDataUnitKeys.item(parameters),
    queryFn: () => fetchGraphDataUnitsLive<Response>(parameters),
    enabled,
  });

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const { isSuccess, dataUpdatedAt } = result;
  useEffect(() => {
    if (isSuccess) {
      onSuccessRef.current?.();
    }
  }, [isSuccess, dataUpdatedAt]);

  return result;
};

export default useGraphDataUnitsLive;
