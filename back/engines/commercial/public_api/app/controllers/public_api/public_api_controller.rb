# frozen_string_literal: true

module PublicApi
  class PublicApiController < ActionController::API
    include Knock::Authenticable
    include Pundit

    before_action :authenticate_api_client
    before_action :check_api_token
    before_action :set_locale

    def set_locale
      I18n.locale = AppConfiguration.instance.closest_locale_to(extract_locale_from_path_or_accept_language_header)
    end

    private

    def extract_locale_from_path_or_accept_language_header
      return params[:locale] if present?

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
