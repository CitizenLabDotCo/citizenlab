import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectAllowedInputKeys from './keys';
import {
  IProjectAllowedTopicsParams,
  ProjectAllowedInputTopicsKeys,
  IProjectAllowedInputTopics,
} from './types';

const fetchProjectAllowedInputTopics = ({
  projectId,
}: IProjectAllowedTopicsParams) =>
  fetcher<IProjectAllowedInputTopics>({
    path: `/projects/${projectId}/projects_allowed_input_topics`,
    action: 'get',
  });

const useProjectAllowedInputTopics = (params: IProjectAllowedTopicsParams) => {
  return useQuery<
    IProjectAllowedInputTopics,
    CLErrors,
    IProjectAllowedInputTopics,
    ProjectAllowedInputTopicsKeys
  >({
    queryKey: projectAllowedInputKeys.list(params),
    queryFn: () => fetchProjectAllowedInputTopics(params),
  });
};

export default useProjectAllowedInputTopics;
