import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import mcpAuthorizationKeys from './keys';

const revokeMCPAuthorization = (id: string) =>
  fetcher({
    path: `/mcp_authorizations/${id}`,
    action: 'delete',
  });

const useRevokeMCPAuthorization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeMCPAuthorization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mcpAuthorizationKeys.lists(),
      });
    },
  });
};

export default useRevokeMCPAuthorization;
