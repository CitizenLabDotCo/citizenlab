import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollOptionsKeys from './keys';
import { IPollOptions, PollOptionsKeys } from './types';

const fetchOptions = ({ questionId }: { questionId: string }) =>
  fetcher<IPollOptions>({
    path: `/poll_questions/${questionId}/poll_options`,
    action: 'get',
  });

const usePollOptions = (questionId: string) => {
  return useQuery<IPollOptions, CLErrors, IPollOptions, PollOptionsKeys>({
    queryKey: pollOptionsKeys.list({ questionId }),
    queryFn: () => fetchOptions({ questionId }),
  });
};

export default usePollOptions;
