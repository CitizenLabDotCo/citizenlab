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
        render json: {
          error: 'invalid_client_metadata',
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
