import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'mcp_authorization' };

const mcpAuthorizationKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
} satisfies QueryKeys;

export default mcpAuthorizationKeys;
