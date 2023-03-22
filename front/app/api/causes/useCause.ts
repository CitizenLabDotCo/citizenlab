import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causeKeys from './keys';
import { ICause, CausesKeys } from './types';

const fetchCause = (id: string) =>
  fetcher<ICause>({ path: `/causes/${id}`, action: 'get' });

const useCause = (id: string) => {
  return useQuery<ICause, CLErrors, ICause, CausesKeys>({
    queryKey: causeKeys.item(id),
    queryFn: () => fetchCause(id),
  });
};

export default useCause;
