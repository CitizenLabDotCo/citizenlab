import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasByStatusKeys from './keys';
import {
  IIdeasByStatus,
  IdeasByStatusKeys,
  IIdeasByStatusParams,
} from './types';

const fetchIdeasByStatus = (params: IIdeasByStatusParams) =>
  fetcher<IIdeasByStatus>({
    path: `/stats/ideas_by_status`,
    action: 'get',
    queryParams: params,
  });

const useIdeasByStatus = ({ ...queryParameters }: IIdeasByStatusParams) => {
  return useQuery<IIdeasByStatus, CLErrors, IIdeasByStatus, IdeasByStatusKeys>({
    queryKey: ideasByStatusKeys.item(queryParameters),
    queryFn: () => fetchIdeasByStatus(queryParameters),
  });
};

export default useIdeasByStatus;
