import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.Admin.tools.MCPAuthorizations.pageTitle',
    defaultMessage: 'MCP authorizations',
  },
  pageDescription: {
    id: 'app.containers.Admin.tools.MCPAuthorizations.pageDescription2',
    defaultMessage:
      'View and manage your client authorizations for MCP (Model Context Protocol) integrations.',
  },
  clientName: {
    id: 'app.containers.Admin.tools.MCPAuthorizations.clientName',
    defaultMessage: 'Client name',
  },
  clientId: {
    id: 'app.containers.Admin.tools.MCPAuthorizations.clientId',
    defaultMessage: 'Client ID',
  },
  actions: {
    id: 'app.containers.Admin.tools.MCPAuthorizations.actions',
    defaultMessage: 'Actions',
  },
  revokeAccess: {
    id: 'app.containers.Admin.tools.MCPAuthorizations.revokeAccess',
    defaultMessage: 'Revoke access',
  },
  revokeConfirmation: {
    id: 'app.containers.Admin.tools.MCPAuthorizations.revokeConfirmation',
    defaultMessage:
      'Revoke this integration’s access? It will need to be re-authorized before it can connect again.',
  },
  noAuthorizations: {
    id: 'app.containers.Admin.tools.MCPAuthorizations.noAuthorizations',
    defaultMessage: 'You have no MCP authorizations yet.',
  },
});
