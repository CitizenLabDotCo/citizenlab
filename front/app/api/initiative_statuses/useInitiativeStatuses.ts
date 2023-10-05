import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeStatusesKeys from './keys';
import { IInitiativeStatuses, InitiativeStatusesKeys } from './types';

const fetchInitiativeStatuses = () =>
  fetcher<IInitiativeStatuses>({ path: '/initiative_statuses', action: 'get' });

const useInitiativeStatuses = ({ enabled = true } = {}) => {
  return useQuery<
    IInitiativeStatuses,
    CLErrors,
    IInitiativeStatuses,
    InitiativeStatusesKeys
  >({
    queryKey: initiativeStatusesKeys.lists(),
    queryFn: fetchInitiativeStatuses,
    enabled,
  });
};

export default useInitiativeStatuses;
