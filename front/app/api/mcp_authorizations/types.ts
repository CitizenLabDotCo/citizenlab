import { Keys } from 'utils/cl-react-query/types';

import mcpAuthorizationKeys from './keys';

export type MCPAuthorizationKeys = Keys<typeof mcpAuthorizationKeys>;

// One entry per client (application) the current user has authorized for MCP.
export interface IMCPAuthorizations {
  data: {
    id: string;
    type: 'mcp_authorization';
    attributes: {
      client_name: string;
      client_id: string;
      authorized_at: string;
      status: 'active';
    };
  }[];
}
