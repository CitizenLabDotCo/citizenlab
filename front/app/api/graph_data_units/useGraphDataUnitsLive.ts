import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';
import graphDataUnitKeys from './keys';
import { ParametersLive } from './types';
import { CLErrors } from 'typings';

const fetchGraphDataUnitsLive = <Response extends BaseResponseData>({
  resolvedName,
  props,
}: ParametersLive) =>
  fetcher<Response>({
    path: `/reports/graph_data_units/live`,
    action: 'get',
    queryParams: {
      resolved_name: resolvedName,
      props: {
        project_id: props.projectId,
        phase_id: props.phaseId,
        resolution: props.resolution,
        start_at: props.startAtMoment?.format('yyyy-MM-DD'),
        end_at: props.endAtMoment?.format('yyyy-MM-DD'),
      },
    },
  });

const useGraphDataUnitsLive = <Response extends BaseResponseData>(
  parameters: ParametersLive,
  {
    enabled = true,
    onSuccess,
  }: {
    enabled?: boolean;
    onSuccess?: () => void;
  } = {}
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
