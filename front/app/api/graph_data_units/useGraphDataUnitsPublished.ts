import { useQuery } from '@tanstack/react-query';
import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';
import graphDataUnitKeys from './keys';
import { ParametersPublished } from './types';
import { CLErrors } from 'typings';

// TODO: Response should extend not BaseResponseData, but sth more specific to data units
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
  parameters: ParametersPublished,
  { enabled = true }: { enabled?: boolean } = { enabled: true }
) => {
  return useQuery<Response, CLErrors, Response, any>({
    queryKey: graphDataUnitKeys.item(parameters),
    queryFn: () => fetchGraphDataUnitsPublished<Response>(parameters),
    enabled: enabled && !!parameters.reportId,
  });
};

export default useGraphDataUnitsPublished;
