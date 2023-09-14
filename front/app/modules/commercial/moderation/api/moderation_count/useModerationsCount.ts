import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasCountKeys from './keys';
import { ModerationsCountKeys, IModerationsCount } from './types';
import { InputParameters } from '../moderations/types';

const fetchModerationsCount = (queryParams: InputParameters) =>
  fetcher<IModerationsCount>({
    path: `/moderations/moderations_count`,
    action: 'get',
    queryParams,
  });

const useModerationsCount = (queryParams: InputParameters) => {
  return useQuery<
    IModerationsCount,
    CLErrors,
    IModerationsCount,
    ModerationsCountKeys
  >({
    queryKey: ideasCountKeys.item(queryParams),
    queryFn: () => fetchModerationsCount(queryParams),
  });
};

export default useModerationsCount;
