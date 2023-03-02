import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
import { IInitiative, InitiativesKeys } from './types';

const fetchInitiativeBySlug = (initiativeSlug: string) =>
  fetcher<IInitiative>({
    path: `/initiatives/by_slug/${initiativeSlug}`,
    action: 'get',
  });

const useInitiativeBySlug = (initiativeSlug: string) => {
  return useQuery<IInitiative, CLErrors, IInitiative, InitiativesKeys>({
    queryKey: initiativesKeys.item(initiativeSlug),
    queryFn: () => fetchInitiativeBySlug(initiativeSlug),
  });
};

export default useInitiativeBySlug;
