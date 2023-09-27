import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import submissionsCountKeys from './keys';
import {
  SubmissionsCountKeys,
  IParameters,
  IFormSubmissionCount,
} from './types';

const getSubmissionCountEndpoint = (projectId: string, phaseId?: string) => {
  return phaseId
    ? `phases/${phaseId}/submission_count`
    : `projects/${projectId}/submission_count`;
};

const fetchSubmissionsCount = ({ projectId, phaseId }: IParameters) =>
  fetcher<IFormSubmissionCount>({
    path: `/${getSubmissionCountEndpoint(projectId, phaseId)}`,
    action: 'get',
  });

const useSubmissionsCount = ({ projectId, phaseId }: IParameters) => {
  return useQuery<
    IFormSubmissionCount,
    CLErrors,
    IFormSubmissionCount,
    SubmissionsCountKeys
  >({
    queryKey: submissionsCountKeys.item({ projectId, phaseId }),
    queryFn: () => fetchSubmissionsCount({ projectId, phaseId }),
  });
};

export default useSubmissionsCount;
