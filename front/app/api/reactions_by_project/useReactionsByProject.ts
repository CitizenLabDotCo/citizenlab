import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reactionsByProjectKeys from './keys';
import {
  IReactionsByProject,
  ReactionsByProjectKeys,
  IReactionsByProjectParams,
} from './types';

const fetchReactionsByProject = (params: IReactionsByProjectParams) =>
  fetcher<IReactionsByProject>({
    path: `/stats/reactions_by_project`,
    action: 'get',
    queryParams: params,
  });

const useReactionsByProject = ({
  enabled,
  ...queryParameters
}: IReactionsByProjectParams & { enabled: boolean }) => {
  return useQuery<
    IReactionsByProject,
    CLErrors,
    IReactionsByProject,
    ReactionsByProjectKeys
  >({
    queryKey: reactionsByProjectKeys.item(queryParameters),
    queryFn: () => fetchReactionsByProject(queryParameters),
    enabled,
  });
};

export default useReactionsByProject;
