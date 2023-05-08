# frozen_string_literal: true

module PublicApi
  class PublicApiController < ActionController::API
    include ::Authenticable
    include Pundit

    before_action :authenticate_api_client
    before_action :check_api_token

    def set_locale
      logger.debug "* Accept-Language: #{request.env['HTTP_ACCEPT_LANGUAGE']}"
      I18n.locale = Tenant.current.closest_locale_to(extract_locale_from_accept_language_header)
      logger.debug "* Locale set to '#{I18n.locale}'"
    end

    private

    def extract_locale_from_accept_language_header
      request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
    end

    def pundit_user
      current_publicapi_apiclient
    end

    def authenticate_api_client
      authenticate_for ApiClient
    end

    def check_api_token
      return if current_publicapi_apiclient

      head :unauthorized
    end
  end
end
