# frozen_string_literal: true

# RFC 7591 OAuth 2.0 Dynamic Client Registration.
# Public, unauthenticated endpoint — anyone can register a new OAuth client.
module Oauth
  class RegistrationsController < ApplicationController
    skip_before_action :authenticate_user
    skip_after_action :verify_authorized

    wrap_parameters :oauth_application

    ALLOWED_REDIRECT_URI_SCHEMES = %w[http https].freeze

    # Rate limiting is handled by Rack::Attack (see config/initializers/rack_attack.rb).

    def create
      redirect_uris = Array(oauth_application_params[:redirect_uris])

      if redirect_uris.empty? || redirect_uris.any? { |uri| !allowed_redirect_uri?(uri) }
        return render json: {
          error: 'invalid_redirect_uri',
          error_description: 'redirect_uris must be absolute http(s) URIs'
        }, status: :bad_request
      end

      application = Doorkeeper::Application.new(
        name: oauth_application_params[:client_name],
        redirect_uri: redirect_uris.join("\n"),
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

    def allowed_redirect_uri?(value)
      return false unless value.is_a?(String)

      uri = URI.parse(value)
      ALLOWED_REDIRECT_URI_SCHEMES.include?(uri.scheme.to_s.downcase) &&
        uri.host.present? &&
        # RFC 6749 §3.1.2 (redirection endpoint should not hold fragment)
        uri.fragment.nil?
    rescue URI::InvalidURIError
      false
    end
  end
end
