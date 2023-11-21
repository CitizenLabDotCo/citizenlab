import { useQuery } from '@tanstack/react-query';
import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';
import graphDataUnitKeys from './keys';
import { ParametersPublished } from './types';
import { CLErrors } from 'typings';

const fetchGraphDataUnitsPublished = <Response extends BaseResponseData>({
  reportId,
  graphId,
}: ParametersPublished) =>
  fetcher<Response>({
    path: `/reports/graph_data_units/published`,
    action: 'get',
    queryParams: {
      report_id: reportId,
      graph_id: graphId,
    },
  });

const useGraphDataUnitsPublished = <Response extends BaseResponseData>(
  parameters: ParametersPublished
) => {
  return useQuery<Response, CLErrors, Response, any>({
    queryKey: graphDataUnitKeys.item(parameters),
    queryFn: () => fetchGraphDataUnitsPublished<Response>(parameters),
  });
};

export default useGraphDataUnitsPublished;

// hack to stop dead code script from complaining
const noop = (_x: any) => {};
noop(useGraphDataUnitsPublished);
