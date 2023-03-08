import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
import { IInitiative, InitiativesKeys } from './types';

const fetchInitiativeById = (initiativeId?: string) =>
  fetcher<IInitiative>({
    path: `/initiatives/${initiativeId}`,
    action: 'get',
  });

const useInitiativeById = (initiativeId?: string) => {
  return useQuery<IInitiative, CLErrors, IInitiative, InitiativesKeys>({
    queryKey: initiativesKeys.item(initiativeId),
    queryFn: () => fetchInitiativeById(initiativeId),
    enabled: !!initiativeId,
  });
};

export default useInitiativeById;
