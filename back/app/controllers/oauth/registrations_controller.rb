# frozen_string_literal: true

# RFC 7591 OAuth 2.0 Dynamic Client Registration.
# Public, unauthenticated endpoint — anyone can register a new OAuth client.
module Oauth
  class RegistrationsController < ApplicationController
    skip_before_action :authenticate_user
    skip_after_action :verify_authorized

    wrap_parameters :oauth_application

    # Rate limiting is handled by Rack::Attack (see config/initializers/rack_attack.rb).

    def create
      application = Doorkeeper::Application.new(
        name: oauth_application_params[:client_name],
        # Doorkeeper stores redirect URIs newline-separated and validates each one.
        redirect_uri: Array(oauth_application_params[:redirect_uris]).join("\n"),
        confidential: false
      )

      if application.save
        render json: {
          client_name: application.name,
          client_id: application.uid,
          client_id_issued_at: application.created_at.to_i,
          redirect_uris: application.redirect_uri.split
        }, status: :created
      else
        # redirect_uri is validated by Doorkeeper (scheme allowlist, SSL, host,
        # fragment, blankness) — see config/initializers/doorkeeper.rb. Map that
        # failure onto the error code RFC 7591 expects for it.
        error = application.errors.include?(:redirect_uri) ? 'invalid_redirect_uri' : 'invalid_client_metadata'
        render json: {
          error: error,
          error_description: application.errors.full_messages.join(', ')
        }, status: :bad_request
      end
    end

    private

    def oauth_application_params
      params.require(:oauth_application).permit(:client_name, redirect_uris: [])
    end
  end
end
