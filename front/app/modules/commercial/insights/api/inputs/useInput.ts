import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IInsightsInput, InputKeys } from './types';
import inputKeys from './keys';

const fetchInput = (viewId: string, id: string) =>
  fetcher<IInsightsInput>({
    path: `/insights/views/${viewId}/inputs/${id}`,
    action: 'get',
  });

const useInput = (viewId: string, id: string) => {
  return useQuery<IInsightsInput, CLErrors, IInsightsInput, InputKeys>({
    queryKey: inputKeys.detail(viewId, id),
    queryFn: () => fetchInput(viewId, id),
  });
};

export default useInput;
