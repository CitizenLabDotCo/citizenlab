module PublicApi
  class PublicApiController < ActionController::API

    def set_locale
      logger.debug "* Accept-Language: #{request.env['HTTP_ACCEPT_LANGUAGE']}"
      I18n.locale = Tenant.current.closest_locale_to(extract_locale_from_accept_language_header)
      logger.debug "* Locale set to '#{I18n.locale}'"
    end
     
    private
      def extract_locale_from_accept_language_header
        request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
      end

  end
end