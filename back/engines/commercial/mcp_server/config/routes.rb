# frozen_string_literal: true

McpServer::Engine.routes.draw do
  # The MCP protocol endpoint (POST /mcp).
  post 'mcp', to: 'mcp#create', as: :mcp

  # MCP authorization management, served as JSON to the SPA under /web_api/v1.
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      # OAuth 2.1 consent screen, served as JSON to the SPA (replaces Doorkeeper's
      # HTML authorize page). See McpServer::WebApi::V1::OauthAuthorizationsController.
      resource :oauth_authorization, only: %i[show create], controller: 'oauth_authorizations'

      # The current user's MCP client authorizations (list + revoke), grouped by
      # client. See McpServer::WebApi::V1::McpAuthorizationsController.
      resources :mcp_authorizations, only: %i[index destroy]
    end
  end
end

Rails.application.routes.draw do
  # Mounted at root (not /mcp) so the engine's routes keep their full paths
  # (POST /mcp and /web_api/v1/...). Mirrors how Webhooks::Engine is mounted.
  mount McpServer::Engine => '', as: 'mcp_server'
end
