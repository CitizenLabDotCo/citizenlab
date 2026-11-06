import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import useIdConfigEnabled from 'hooks/useIdConfigEnabled';

import fetcher from 'utils/cl-react-query/fetcher';

import idMethodsKeys from './keys';
import { IdMethodsKeys, IdMethods } from './types';

const fetchIdMethods = () =>
  fetcher<IdMethods>({
    path: `/id_methods`,
    action: 'get',
  });

const useIdMethods = () => {
  const idConfigEnabled = useIdConfigEnabled();

  return useQuery<IdMethods, CLErrors, IdMethods, IdMethodsKeys>({
    queryKey: idMethodsKeys.list(),
    queryFn: () => fetchIdMethods(),
    select: (idMethods) =>
      idConfigEnabled ? idMethods : { ...idMethods, data: [] },
  });
};

export default useIdMethods;
