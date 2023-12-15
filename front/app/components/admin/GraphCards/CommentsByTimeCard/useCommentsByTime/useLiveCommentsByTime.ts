import useGraphDataUnitsLive from 'api/graph_data_units/useGraphDataUnitsLive';
import { Response, QueryParameters } from './typings';

const useLiveCommentsByTime = (
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
      resolvedName: 'CommentsByTimeWidget',
      props: queryParameters,
    },
    { enabled, onSuccess }
  );
};

export default useLiveCommentsByTime;
