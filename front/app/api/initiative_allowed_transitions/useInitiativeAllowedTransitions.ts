import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesAllowedTransitionsKeys from './keys';
import {
  IInitiativeAllowedTransitions,
  InitiativeAllowedTransitonsKeys,
} from './types';

const fetchInitativeAllowedTransitions = ({ id }: { id: string }) =>
  fetcher<IInitiativeAllowedTransitions>({
    path: `/initiatives/${id}/allowed_transitions`,
    action: 'get',
  });

const useInitiativeAllowedTransitions = (id: string) => {
  return useQuery<
    IInitiativeAllowedTransitions,
    CLErrors,
    IInitiativeAllowedTransitions,
    InitiativeAllowedTransitonsKeys
  >({
    queryKey: initiativesAllowedTransitionsKeys.item({ id }),
    queryFn: () => fetchInitativeAllowedTransitions({ id }),
  });
};

export default useInitiativeAllowedTransitions;
