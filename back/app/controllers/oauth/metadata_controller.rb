# frozen_string_literal: true

# RFC 8414 OAuth 2.0 Authorization Server Metadata.
module Oauth
  class MetadataController < ApplicationController
    skip_before_action :authenticate_user
    skip_after_action :verify_authorized

    def authorization_server
      render json: {
        issuer: AppConfiguration.instance.base_backend_uri,
        authorization_endpoint: oauth_authorization_url,
        token_endpoint: oauth_token_url,
        registration_endpoint: oauth_registrations_url,
        revocation_endpoint: oauth_revoke_url,
        introspection_endpoint: oauth_introspect_url,
        response_types_supported: ['code'],
        grant_types_supported: %w[authorization_code refresh_token],
        token_endpoint_auth_methods_supported: ['none'],
        scopes_supported: Doorkeeper.config.scopes.to_a,
        code_challenge_methods_supported: ['S256']
      }
    end

    # RFC 9728 OAuth 2.0 Protected Resource Metadata.
    def protected_resource
      render json: {
        resource: mcp_server_url,
        resource_name: 'Go Vocal MCP Server',
        authorization_servers: [AppConfiguration.instance.base_backend_uri],
        bearer_methods_supported: ['header'],
        scopes_supported: Doorkeeper.config.scopes.to_a
      }
    end
  end
end
