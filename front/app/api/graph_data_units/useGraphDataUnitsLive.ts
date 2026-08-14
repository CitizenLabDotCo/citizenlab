import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';
import useOnQuerySuccess from 'utils/cl-react-query/useOnQuerySuccess';

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
  const result = useQuery<Response, CLErrors, Response, any>({
    queryKey: graphDataUnitKeys.item(parameters),
    queryFn: () => fetchGraphDataUnitsLive<Response>(parameters),
    enabled,
  });

  useOnQuerySuccess(result, onSuccess);

  return result;
};

export default useGraphDataUnitsLive;
