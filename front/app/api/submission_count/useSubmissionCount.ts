import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import submissionsCountKeys from './keys';
import {
  SubmissionsCountKeys,
  IParameters,
  IFormSubmissionCount,
} from './types';

const getSubmissionCountEndpoint = (phaseId?: string) => {
  return `phases/${phaseId}/submission_count`;
};

const fetchSubmissionsCount = ({ phaseId }: IParameters) =>
  fetcher<IFormSubmissionCount>({
    path: `/${getSubmissionCountEndpoint(phaseId)}`,
    action: 'get',
  });

const useSubmissionsCount = ({ phaseId }: IParameters) => {
  return useQuery<
    IFormSubmissionCount,
    CLErrors,
    IFormSubmissionCount,
    SubmissionsCountKeys
  >({
    queryKey: submissionsCountKeys.item({ phaseId }),
    queryFn: () => fetchSubmissionsCount({ phaseId }),
    enabled: !!phaseId,
  });
};

export default useSubmissionsCount;
