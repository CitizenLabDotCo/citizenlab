import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeActionDescriptorsKeys from './keys';
import {
  IInitiativeActionDescriptors,
  InitiativeActionDescriptorsKeys,
} from './types';

const fetchInitativeActionDescriptors = () =>
  fetcher<IInitiativeActionDescriptors>({
    path: '/action_descriptors/initiatives',
    action: 'get',
  });

const useInitiativeActionDescriptors = () => {
  return useQuery<
    IInitiativeActionDescriptors,
    CLErrors,
    IInitiativeActionDescriptors,
    InitiativeActionDescriptorsKeys
  >({
    queryKey: initiativeActionDescriptorsKeys.items(),
    queryFn: fetchInitativeActionDescriptors,
  });
};

export default useInitiativeActionDescriptors;
