# frozen_string_literal: true

module Verification
  module Patches
    module OmniauthCallbackController
      def get_verification_method(provider)
        verification_service.method_by_name(provider)
      end

      def handle_verification(auth, user)
        configuration = AppConfiguration.instance
        return unless configuration.feature_activated?('verification')
        return unless verification_service.active?(configuration, auth.provider)

        verification_service.verify_omniauth(auth: auth, user: user)
      end

      def verification_callback(verification_method)
        auth = request.env['omniauth.auth']
        omniauth_params = request.env['omniauth.params'].except('token')

        begin
          @user = verification_method.fetch_user(request)
          if @user&.invite_not_pending?
            begin
              handle_verification(auth, @user)
              update_user!(auth, @user, verification_method)
              url = add_uri_params(
                Frontend::UrlService.new.verification_success_url(locale: @user.locale, pathname: omniauth_params['pathname']),
                omniauth_params.merge(verification_success: true).except('pathname')
              )
              redirect_to url
            rescue VerificationService::VerificationTakenError
              fail_verification('taken')
            rescue VerificationService::NotEntitledError => e
              message = e.why ? "not_entitled_#{e.why}" : 'not_entitled'
              fail_verification(message)
            end
          end
        rescue ActiveRecord::RecordNotFound
          fail_verification('no_token_passed')
        end
      end

      def fail_verification(error)
        omniauth_params = request.env['omniauth.params'].except('token', 'pathname')

        # It seems the FE is not parsing verification failure URLs, so we need to use the SSO failure URL structure
        if error == 'not_entitled_under_15_years_of_age'
          redirect_params = {
            sso_pathname: request.env['omniauth.params']['pathname'],
            sso_response: true,
            error_code: 'not_entitled_under_15_years_of_age'
          }
          redirect_to(add_uri_params(Frontend::UrlService.new.signin_failure_url, redirect_params))
        else # TODO: Check if this is ever used by the FE, or anywhere else.
          url = add_uri_params(
            Frontend::UrlService.new.verification_failure_url(pathname: request.env['omniauth.params']['pathname']),
            omniauth_params.merge(verification_error: true, error: error)
          )
          redirect_to url
        end
      end

      def verification_service
        @verification_service ||= VerificationService.new
      end
    end
  end
end
