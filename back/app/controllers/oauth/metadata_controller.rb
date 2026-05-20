# frozen_string_literal: true

# RFC 8414 OAuth 2.0 Authorization Server Metadata.
module Oauth
  class MetadataController < ApplicationController
    skip_before_action :authenticate_user
    skip_after_action :verify_authorized

    def authorization_server
      render json: {
        issuer: request.base_url,
        authorization_endpoint: oauth_authorization_url,
        token_endpoint: oauth_token_url,
        registration_endpoint: oauth_registrations_url,
        revocation_endpoint: oauth_revoke_url,
        introspection_endpoint: oauth_introspect_url,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code'],
        token_endpoint_auth_methods_supported: ['none'],
        scopes_supported: Doorkeeper.config.scopes.to_a,
        code_challenge_methods_supported: ['S256']
      }
    end
  end
end
