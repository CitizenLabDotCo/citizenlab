# frozen_string_literal: true

McpServer::Engine.routes.draw do
  post 'mcp', to: 'mcp#create', as: :mcp

  # Cross-tenant channel for the internal staff MCP gateway (admin-hq). The
  # /admin_api path prefix is deliberate: those paths bypass host-based tenant
  # switching (see multi_tenancy's apartment.rb middleware), so the controller
  # starts in the public schema and switches via the X-Tenant-Host header.
  post 'admin_api/mcp', to: 'internal_mcp#create', as: :internal_mcp

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
