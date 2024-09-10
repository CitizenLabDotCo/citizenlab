# frozen_string_literal: true

module Verification
  module Patches
    module OmniauthCallbackController
      def create
        @verify = verification_method.present?
        # If token is present, the user is already logged in, which means they try to verify not authenticate.
        # We need it only for providers that support both auth and verification except France Connect.
        # For France Connect, we never verify, only authenticate (even when user clicks "verify"). Not sure why.
        if verification_method && (!auth_method || (request.env['omniauth.params']['token'].present? && auth_method&.verification_prioritized?))
          verification_callback
        else
          # Only authentication
          super
        end
      end

      private

      def find_existing_user(user_attrs)
        super

        if @verify
          # Try and find the user by verification for verification methods without an email
          uid = auth_method.profile_to_uid(auth)
          verification = VerificationService.new.verifications_by_uid(uid, auth_method).first
          verification&.user
        end
      end

      def sign_in(sign_up: true, user_created: false)
        continue_auth = @verify ? verified_for_sso?(user_created) : true
        return unless continue_auth

        super
      end

      def handle_verification
        configuration = AppConfiguration.instance
        return unless configuration.feature_activated?('verification')
        return unless verification_service.active?(configuration, auth.provider)

        verification_service.verify_omniauth(auth: auth, user: @user)
      end

      def verification_callback
        @user = AuthToken::AuthToken.new(token: omniauth_params['token']).entity_for(::User)
        if @user&.invite_not_pending?
          begin
            handle_verification
            update_user!
            url = add_uri_params(
              Frontend::UrlService.new.verification_return_url(locale: Locale.new(@user.locale), pathname: omniauth_params['pathname']),
              filter_omniauth_params.merge(verification_success: true)
            )
            redirect_to url
          rescue VerificationService::VerificationTakenError
            verification_failure_redirect('taken')
          rescue VerificationService::NotEntitledError => e
            verification_failure_redirect(not_entitled_error(e))
          end
        end
      rescue ActiveRecord::RecordNotFound
        verification_failure_redirect('no_token_passed')
      end

      def verified_for_sso?(user_created)
        handle_verification
        true
      rescue VerificationService::NotEntitledError => e
        # In some cases, it may be fine not to verify during SSO, so we enable this specifically in the method
        return true unless verification_method.respond_to?(:check_entitled_on_sso?) && verification_method.check_entitled_on_sso?

        @user.destroy if user_created # TODO: Probably should not be created in the first place, but bigger refactor required to fix
        signin_failure_redirect(error_code: not_entitled_error(e))
        false
      end

      def not_entitled_error(error)
        error.why ? "not_entitled_#{error.why}" : 'not_entitled'
      end

      def verification_failure_redirect(error)
        params = filter_omniauth_params
        url = add_uri_params(
          Frontend::UrlService.new.verification_return_url(pathname: omniauth_params['pathname']),
          params.merge(verification_error: true, error_code: error)
        )
        redirect_to url
      end

      # TODO: JS - Is verification method and auth method the same? Or can it be instantiated separately?
      def verification_method
        @verification_method ||= verification_service.method_by_name(auth['provider'])
      end

      def verification_service
        @verification_service ||= VerificationService.new
      end
    end
  end
end
