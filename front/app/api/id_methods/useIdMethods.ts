import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import idMethodsKeys from './keys';
import { IdMethodsKeys, IdMethods } from './types';

const fetchIdMethods = () =>
  fetcher<IdMethods>({
    path: `/id_methods`,
    action: 'get',
  });

const useIdMethods = () => {
  return useQuery<
    IdMethods,
    CLErrors,
    IdMethods,
    IdMethodsKeys
  >({
    queryKey: idMethodsKeys.list(),
    queryFn: () => fetchIdMethods(),
  });
};

export default useIdMethods;
