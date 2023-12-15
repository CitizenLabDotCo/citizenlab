import useGraphDataUnitsLive from 'api/graph_data_units/useGraphDataUnitsLive';
import { Response, QueryParameters } from './typings';

const useLivePostsByTime = (
  queryParameters: QueryParameters,
  {
    enabled = true,
    onSuccess,
  }: {
    enabled?: boolean;
    onSuccess?: () => void;
  } = {}
) => {
  return useGraphDataUnitsLive<Response>(
    {
      resolvedName: 'PostsByTimeWidget',
      props: queryParameters,
    },
    { enabled, onSuccess }
  );
};

export default useLivePostsByTime;
