import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { Response, QueryParameters } from './typings';
import reactionsByTimeKeys from './keys';

const fetchReactionsByTime = (props: QueryParameters) =>
  fetcher<Response>({
    path: `/reports/graph_data_units/published`,
    action: 'get',
    queryParams: {
      resolved_name: 'ReactionsByTimeWidget',
      props: {
        projectId: props.projectId,
        resolution: props.resolution,
        startAt: props.startAtMoment?.format('yyyy-MM-DD'),
        endAt: props.endAtMoment?.format('yyyy-MM-DD'),
      },
    },
  });

const usePublishedReactionsByTime = ({
  ...queryParameters
}: QueryParameters) => {
  return useQuery<Response, CLErrors, Response, any>({
    queryKey: reactionsByTimeKeys.item(queryParameters),
    queryFn: () => fetchReactionsByTime(queryParameters),
  });
};

export default usePublishedReactionsByTime;
