import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
import { IInitiative, InitiativesKeys } from './types';

const fetchInitiativeBySlug = ({ slug }: { slug?: string }) =>
  fetcher<IInitiative>({
    path: `/initiatives/by_slug/${slug}`,
    action: 'get',
  });

const useInitiativeBySlug = (initiativeSlug?: string) => {
  return useQuery<IInitiative, CLErrors, IInitiative, InitiativesKeys>({
    queryKey: initiativesKeys.item({ slug: initiativeSlug }),
    queryFn: () => fetchInitiativeBySlug({ slug: initiativeSlug }),
    enabled: !!initiativeSlug,
  });
};

export default useInitiativeBySlug;
