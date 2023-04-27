import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import areasKeys from './keys';
import { IArea, AreasKeys } from './types';

const fetchArea = ({ id }: { id: string }) =>
  fetcher<IArea>({ path: `/areas/${id}`, action: 'get' });

const useArea = (id: string) => {
  return useQuery<IArea, CLErrors, IArea, AreasKeys>({
    queryKey: areasKeys.item({ id }),
    queryFn: () => fetchArea({ id }),
  });
};

export default useArea;
