import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeStatusesKeys from './keys';
import { IInitiativeStatus, InitiativeStatusesKeys } from './types';

const fetchInitiativeStatus = ({ id }: { id: string }) =>
  fetcher<IInitiativeStatus>({
    path: `/initiative_statuses/${id}`,
    action: 'get',
  });

const useInitiativeStatus = (id: string) => {
  return useQuery<
    IInitiativeStatus,
    CLErrors,
    IInitiativeStatus,
    InitiativeStatusesKeys
  >({
    queryKey: initiativeStatusesKeys.item({ id }),
    queryFn: () => fetchInitiativeStatus({ id }),
  });
};

export default useInitiativeStatus;
