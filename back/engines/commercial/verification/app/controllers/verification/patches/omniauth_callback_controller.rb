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
          @user = AuthToken::AuthToken.new(token: request.env['omniauth.params']['token']).entity_for(::User)
          if @user&.invite_not_pending?
            begin
              handle_verification(auth, @user)
              update_user!(auth, @user, verification_method)
              url = add_uri_params(
                Frontend::UrlService.new.verification_success_url(locale: Locale.new(@user.locale), pathname: omniauth_params['pathname']),
                omniauth_params.merge(verification_success: true).except('pathname')
              )
              redirect_to url
            rescue VerificationService::VerificationTakenError
              fail_verification('taken')
            rescue VerificationService::NotEntitledError => e
              fail_verification(not_entitled_error(e))
            end
          end
        rescue ActiveRecord::RecordNotFound
          fail_verification('no_token_passed')
        end
      end

      def handle_sso_verification(auth, user, user_created)
        handle_verification(auth, user)
        true
      rescue VerificationService::NotEntitledError => e
        # In some cases, it may be fine not to verify during SSO, so we enable this specifically in the method
        return true unless verification_method.respond_to?(:check_entitled_on_sso?) && verification_method.check_entitled_on_sso?

        user.destroy if user_created # TODO: Probably should not be created in the first place, but bigger refactor required to fix
        failure_redirect(error_code: not_entitled_error(e))
        return false
      end

      def not_entitled_error(error)
        error.why ? "not_entitled_#{error.why}" : 'not_entitled'
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
