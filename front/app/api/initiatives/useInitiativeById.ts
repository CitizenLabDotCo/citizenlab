import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
import { IInitiative, InitiativeKeys } from './types';

const fetchInitiativeById = (initiativeId: string) =>
  fetcher<IInitiative>({
    path: `/initiatives/${initiativeId}`,
    action: 'get',
  });

const useInitiativeById = (initiativeId: string | null) => {
  return useQuery<IInitiative, CLErrors, IInitiative, InitiativeKeys>({
    queryKey: initiativeId ? initiativesKeys.item(initiativeId) : undefined,
    queryFn: initiativeId ? () => fetchInitiativeById(initiativeId) : undefined,
    enabled: !!initiativeId,
  });
};

export default useInitiativeById;
