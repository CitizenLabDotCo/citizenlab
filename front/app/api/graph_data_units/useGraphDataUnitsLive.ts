import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';
import graphDataUnitKeys from './keys';
import { ParametersLive, Options } from './types';
import { CLErrors } from 'typings';

const fetchGraphDataUnitsLive = <Response extends BaseResponseData>({
  resolvedName,
  props,
}: ParametersLive) => {
  const _props = props as any;

  return fetcher<Response>({
    path: `/reports/graph_data_units/live`,
    action: 'get',
    queryParams: {
      resolved_name: resolvedName,
      props: {
        project_id: _props.projectId,
        phase_id: _props.phaseId,
        resolution: _props.resolution,
        group_id: _props.groupId,
        number_of_ideas: _props.numberOfIdeas,
        start_at: _props.startAtMoment?.format('yyyy-MM-DD'),
        end_at: _props.endAtMoment?.format('yyyy-MM-DD'),
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
