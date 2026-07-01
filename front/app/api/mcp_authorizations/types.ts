import { Keys } from 'utils/cl-react-query/types';

import mcpAuthorizationKeys from './keys';

export type MCPAuthorizationKeys = Keys<typeof mcpAuthorizationKeys>;

export interface IMCPAuthorizations {
  data: {
    id: string;
    type: 'mcp_authorization';
    attributes: {
      client_name: string;
      client_id: string;
    };
  }[];
}
