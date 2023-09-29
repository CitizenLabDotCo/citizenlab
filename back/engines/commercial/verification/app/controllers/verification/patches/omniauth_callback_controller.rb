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
              if e.message == 'not_entitled_under_minimum_age'
                fail_verification(e.message)
              else
                fail_verification('not_entitled')
              end
            end
          end
        rescue ActiveRecord::RecordNotFound
          fail_verification('no_token_passed')
        end
      end

      def fail_verification(error)
        omniauth_params = request.env['omniauth.params'].except('token', 'pathname')

        url = add_uri_params(
          Frontend::UrlService.new.verification_failure_url(pathname: request.env['omniauth.params']['pathname']),
          omniauth_params.merge(verification_error: true, error: error)
        )
        redirect_to url
      end

      def verification_service
        @verification_service ||= VerificationService.new
      end
    end
  end
end
