import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import mcpAuthorizationKeys from './keys';
import { IMCPAuthorizations, MCPAuthorizationKeys } from './types';

const fetchMCPAuthorizations = () =>
  fetcher<IMCPAuthorizations>({
    path: '/mcp_authorizations',
    action: 'get',
  });

const useMCPAuthorizations = () =>
  useQuery<
    IMCPAuthorizations,
    CLErrors,
    IMCPAuthorizations,
    MCPAuthorizationKeys
  >({
    queryKey: mcpAuthorizationKeys.lists(),
    queryFn: fetchMCPAuthorizations,
  });

export default useMCPAuthorizations;
