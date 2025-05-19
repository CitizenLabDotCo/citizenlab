# frozen_string_literal: true

class OmniauthCallbackController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized

  def create
    if auth_method && verification_method
      # If token is present, the user is already logged in, which means they try to verify not authenticate.
      if omniauth_params['token'].present? && auth_method.verification_prioritized?
        # We need it only for providers that support both auth and ver except FC.
        # For FC, we never verify, only authenticate (even when user clicks "verify"). Not sure why.
        verification_callback(verification_method)
      else
        auth_callback(verify: true, authver_method: auth_method)
      end
    elsif auth_method
      auth_callback(verify: false, authver_method: auth_method)
    elsif verification_method
      verification_callback(verification_method)
    else
      raise "#{auth_provider} not supported"
    end
  end

  def failure
    signin_failure_redirect
  end

  def logout_data
    provider = params[:provider]
    user_id = params[:user_id]
    user = User.find_by(id: user_id)
    url = user ? authentication_service.logout_url(provider, user) : Frontend::UrlService.new.home_url
    render json: { url: url }
  end

  private

  def omniauth_params
    request.env['omniauth.params']
  end

  def find_existing_user(authver_method, auth, user_attrs, verify:)
    user = User.find_by_cimail(user_attrs.fetch(:email)) if user_attrs.key?(:email) # some providers don't return email
    return user if user

    if verify
      # Try and find the user by verification for verification methods without an email
      uid = authver_method.profile_to_uid(auth)
      verification = Verification::VerificationService.new.verifications_by_uid(uid, authver_method).first
      verification&.user
    end
  end

  def auth_callback(verify: false, authver_method: nil)
    auth = request.env['omniauth.auth']
    user_attrs = authver_method.profile_to_user_attrs(auth)

    @identity = Identity.find_or_build_with_omniauth(auth, authver_method)
    @user = @identity.user || find_existing_user(authver_method, auth, user_attrs, verify: verify)
    @user = authentication_service.prevent_user_account_hijacking @user

    # For FranceConnect only: https://github.com/CitizenLabDotCo/citizenlab/pull/3055#discussion_r1019061643
    if @user && !authver_method.can_merge?(@user, user_attrs, params[:sso_verification])
      # `sso_flow: 'signin'` - even if user signs up, we propose to sign in due to the content of the error message
      signin_failure_redirect(error_code: authver_method.merging_error_code, sso_flow: 'signin')
      return
    end

    if @user
      @identity.update(user: @user) unless @identity.user

      if @user.invite_pending?
        @invite = @user.invitee_invite
        if !@invite || @invite.accepted_at
          signin_failure_redirect
          return
        end
        UserService.assign_params_in_accept_invite(@user, user_attrs)
        ActiveRecord::Base.transaction do
          SideFxInviteService.new.before_accept @invite
          @user.save!
          SideFxUserService.new.after_update(@user, nil) # Logs 'registration_completed' activity Job`
          @invite.save!
          SideFxInviteService.new.after_accept @invite # Logs 'accepted' activity Job
          verify_and_sign_in(auth, @user, verify, sign_up: true)
        rescue ActiveRecord::RecordInvalid => e
          ErrorReporter.report(e)
          signin_failure_redirect
        end

      else # !@user.invite_pending?
        begin
          update_user!(auth, @user, authver_method)
          SideFxUserService.new.after_update(@user, nil)
        rescue ActiveRecord::RecordInvalid => e
          ErrorReporter.report(e)
          signin_failure_redirect
          return
        end
        verify_and_sign_in(auth, @user, verify, sign_up: false)
      end

    else # New user
      confirm = authver_method.email_confirmed?(auth)
      user_locale = get_user_locale(omniauth_params, user_attrs)

      @user = UserService.build_in_sso(user_attrs, confirm, user_locale)

      @user.identities << @identity
      begin
        @user.save!
        SideFxUserService.new.after_create(@user, nil)
        verify_and_sign_in(auth, @user, verify, sign_up: true, user_created: true)
      rescue ActiveRecord::RecordInvalid => e
        Rails.logger.info "Social signup failed: #{e.message}"
        signin_failure_redirect
      end
    end
  end

  def verify_and_sign_in(auth, user, verify, sign_up: true, user_created: false)
    continue_auth = verify ? verified_for_sso?(auth, user, user_created) : true
    return unless continue_auth

    set_auth_cookie(provider: auth['provider'])
    if sign_up
      signup_success_redirect
    else
      signin_success_redirect
    end
  end

  def signin_success_redirect
    omniauth_params = filter_omniauth_params
    omniauth_params['sso_flow'] = 'signin'
    omniauth_params['sso_success'] = true
    redirect_to(
      add_uri_params(
        Frontend::UrlService.new.sso_return_url(pathname: sso_redirect_path, locale: Locale.new(@user.locale)),
        omniauth_params
      )
    )
  end

  def signup_success_redirect
    omniauth_params = filter_omniauth_params
    omniauth_params['sso_flow'] = 'signup'
    omniauth_params['sso_success'] = true
    redirect_to(
      add_uri_params(
        Frontend::UrlService.new.sso_return_url(pathname: sso_redirect_path, locale: Locale.new(@user.locale)),
        omniauth_params
      )
    )
  end

  def signin_failure_redirect(params = {})
    params['authentication_error'] = true
    redirect_to(
      add_uri_params(
        Frontend::UrlService.new.sso_return_url(pathname: sso_redirect_path),
        filter_omniauth_params.merge(params)
      )
    )
  end

  def sso_redirect_path
    omniauth_params&.dig('sso_pathname') || '/'
  end

  # Reject any parameters we don't need to be passed to the frontend in the URL
  def filter_omniauth_params
    omniauth_params&.except('token', 'verification_pathname', 'sso_pathname') || {}
  end

  def add_uri_params(uri, params = {})
    uri = URI.parse(uri)
    new_query_ar = URI.decode_www_form(String(uri.query))
    params&.each do |key, value|
      new_query_ar << [key, value]
    end
    uri.query = URI.encode_www_form(new_query_ar)
    uri.to_s
  end

  def auth_token(entity, provider)
    payload = if entity.respond_to? :to_token_payload
      entity.to_token_payload
    else
      { sub: entity.id }
    end

    AuthToken::AuthToken.new payload: payload.merge({
      provider: provider,
      logout_supported: authentication_service.supports_logout?(provider)
    })
  end

  def set_auth_cookie(provider: nil)
    cookies[:cl2_jwt] = {
      value: auth_token(@user, provider).token,
      expires: 1.month.from_now,
      secure: false, # Unfortunately, we can't use secure cookies in production yet (probably some HTTP steps somewhere)
      same_site: 'Lax' # Strict won't work due to SSO redirect, so we explicitly document use of Lax
    }
  end

  # Updates the user with attributes from the auth response if `updateable_user_attrs` is set
  # Overwrites current attributes by default unless `overwrite_attrs?` is set to false on the authver method
  # @param [OmniauthMethods::Base] authver_method
  # @param [User] user
  def update_user!(auth, user, authver_method)
    attrs = authver_method.updateable_user_attrs
    sso_user_attrs = authver_method.profile_to_user_attrs(auth)
    user_params = sso_user_attrs.slice(*attrs).compact
    user_params.delete(:remote_avatar_url) if user.avatar.present? # don't overwrite avatar if already present

    sso_email_is_used = sso_user_attrs[:email].present? && (sso_user_attrs[:email] == (user_params[:email] || user.email))
    confirm_user = authver_method.email_confirmed?(auth) && sso_email_is_used

    UserService.update_in_sso!(user, user_params, confirm_user)
  end

  # Return locale if a locale can be parsed from pathname which matches an app locale
  # and is not the default locale.
  # If that fails, return the locale returned by the SSO provider.
  # If that also fails, just return the default locale.
  def get_user_locale(omniauth_params, user_attrs)
    locales = AppConfiguration.instance.settings.dig('core', 'locales')
    sso_pathname = omniauth_params['sso_pathname']
    locale_in_pathname = sso_pathname ? sso_pathname.split('/', 2)[1].split('/')[0] : nil

    if locale_in_pathname.present? && locales.include?(locale_in_pathname) && locale_in_pathname != locales.first
      return locale_in_pathname
    end

    if user_attrs[:locale].present? && locales.include?(user_attrs[:locale])
      return user_attrs[:locale]
    end

    locales.first
  end

  def authentication_service
    @authentication_service ||= AuthenticationService.new
  end

  def auth_provider
    @auth_provider ||= request.env.dig('omniauth.auth', 'provider')
  end

  def auth_method
    @auth_method ||= authentication_service.method_by_provider(auth_provider)
  end

  def handle_verification(auth, user)
    configuration = AppConfiguration.instance
    return unless configuration.feature_activated?('verification')
    return unless verification_service.active?(configuration, auth.provider)

    verification_service.verify_omniauth(auth: auth, user: user)
  end

  def verification_callback(verification_method)
    auth = request.env['omniauth.auth']

    begin
      @user = AuthToken::AuthToken.new(token: omniauth_params['token']).entity_for(::User)
      if @user&.invite_not_pending?
        begin
          handle_verification(auth, @user)
          update_user!(auth, @user, verification_method)
          url = add_uri_params(
            Frontend::UrlService.new.verification_return_url(locale: Locale.new(@user.locale), pathname: omniauth_params['verification_pathname']),
            filter_omniauth_params.merge(verification_success: true)
          )
          redirect_to url
        rescue Verification::VerificationService::VerificationTakenError
          verification_failure_redirect('taken')
        rescue Verification::VerificationService::NotEntitledError => e
          verification_failure_redirect(not_entitled_error(e))
        end
      end
    rescue ActiveRecord::RecordNotFound
      verification_failure_redirect('no_token_passed')
    end
  end

  def verified_for_sso?(auth, user, user_created)
    handle_verification(auth, user)
    true
  rescue Verification::VerificationService::NotEntitledError => e
    # In some cases, it may be fine not to verify during SSO, so we enable this specifically in the method
    return true unless verification_method.respond_to?(:check_entitled_on_sso?) && verification_method.check_entitled_on_sso?

    user.destroy if user_created # TODO: Probably should not be created in the first place, but bigger refactor required to fix
    signin_failure_redirect(error_code: not_entitled_error(e))
    false
  end

  def not_entitled_error(error)
    error.why ? "not_entitled_#{error.why}" : 'not_entitled'
  end

  def verification_failure_redirect(error)
    url = add_uri_params(
      Frontend::UrlService.new.verification_return_url(pathname: omniauth_params['verification_pathname']),
      filter_omniauth_params.merge(verification_error: true, error_code: error)
    )
    redirect_to url
  end

  def verification_method
    @verification_method ||= verification_service.method_by_name(auth_provider)
  end

  def verification_service
    @verification_service ||= Verification::VerificationService.new
  end
end
