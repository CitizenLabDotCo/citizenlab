import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import groupKeys from './keys';
import { IGroup, GroupsKeys } from './types';

const fetchGroup = ({ id }: { id: string }) =>
  fetcher<IGroup>({ path: `/groups/${id}`, action: 'get' });

const useGroup = (id: string) => {
  return useQuery<IGroup, CLErrors, IGroup, GroupsKeys>({
    queryKey: groupKeys.item({ id }),
    queryFn: () => fetchGroup({ id }),
  });
};

export default useGroup;
