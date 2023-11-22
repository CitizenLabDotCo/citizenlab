import { useQuery } from '@tanstack/react-query';
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
        resolution: props.resolution,
        start_at: props.startAtMoment?.format('yyyy-MM-DD'),
        end_at: props.endAtMoment?.format('yyyy-MM-DD'),
      },
    },
  });

const useGraphDataUnitsLive = <Response extends BaseResponseData>(
  parameters: ParametersLive
) => {
  return useQuery<Response, CLErrors, Response, any>({
    queryKey: graphDataUnitKeys.item(parameters),
    queryFn: () => fetchGraphDataUnitsLive<Response>(parameters),
  });
};

export default useGraphDataUnitsLive;
