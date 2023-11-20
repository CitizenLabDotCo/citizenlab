import useGraphDataUnitsLive from 'api/graph_data_units/useGraphDataUnitsLive';
import { Response, QueryParameters } from './typings';

const useLiveReactionsByTime = (queryParameters: QueryParameters) => {
  return useGraphDataUnitsLive<Response>({
    resolvedName: 'ReactionsByTimeWidget',
    props: queryParameters,
  });
};

export default useLiveReactionsByTime;
