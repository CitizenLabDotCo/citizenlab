import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import invitesKeys from './keys';

export interface QueryParams {
  importId?: string | null;
}

// TODO: SORT OUT THE TYPES
const fetchInviteImports = ({ importId }: QueryParams) =>
  fetcher<any>({
    path: `/invites_imports/${importId}`,
    action: 'get',
  });

const useInviteImports = (
  queryParams: QueryParams,
  { pollingEnabled }: { pollingEnabled?: boolean } = {}
) => {
  return useQuery<any, CLErrors, any, any>({
    queryKey: invitesKeys.lists(),
    queryFn: () => fetchInviteImports(queryParams),
    refetchInterval: pollingEnabled ? 5000 : false,
  });
};

export default useInviteImports;
