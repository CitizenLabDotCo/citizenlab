# frozen_string_literal: true

class OmniauthCallbackController < ApplicationController
  include ActionController::Cookies
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized

  def create
    auth_provider = request.env.dig('omniauth.auth', 'provider')
    auth_method = AuthenticationService.new.method_by_provider(auth_provider)
    verification_method = get_verification_method(auth_provider)

    if auth_method && verification_method
      auth_or_verification_callback(verify: verification_method, authver_method: auth_method)
    elsif auth_method
      auth_callback(verify: verification_method, authver_method: auth_method)
    elsif verification_method
      verification_callback(verification_method)
    else
      raise "#{auth_provider} not supported"
    end
  end

  def failure
    failure_redirect
  end

  def logout
    provider = params[:provider]
    user_id = params[:user_id]
    user = User.find(user_id)
    auth_service = AuthenticationService.new

    url = auth_service.logout_url(provider, user)

    redirect_to url, allow_other_host: true
  rescue ActiveRecord::RecordNotFound
    redirect_to Frontend::UrlService.new.home_url
  end

  private

  # Only methods that support both verification and authentication use it.
  def auth_or_verification_callback(verify:, authver_method:)
    # If token is present, the user is already logged in, which means they try to verify not authenticate.
    if verify.fetch_token(request).present? && authver_method.verification_prioritized?
      # We need it only for providers that support both auth and ver except FC.
      # For FC, we never verify, only authenticate (even when user clicks "verify").
      verification_callback(verify)
      # Apart from verification, we also create an identity to be able to authenticate with this provider.
      auth = request.env['omniauth.auth']
      @identity = Identity.find_or_build_with_omniauth(auth, authver_method)
      @identity.update(user: @user) unless @identity.user
    else
      auth_callback(verify: verify, authver_method: authver_method)
    end
  end

  def auth_callback(verify:, authver_method:)
    auth = request.env['omniauth.auth']
    omniauth_params = request.env['omniauth.params']
    provider = auth['provider']
    user_attrs = authver_method.profile_to_user_attrs(auth)

    @identity = Identity.find_or_build_with_omniauth(auth, authver_method)

    @user = @identity.user

    if @user.nil? && user_attrs.key?(:email) # some providers (ClaveUnica) don't return email
      @user = User.find_by_cimail(user_attrs.fetch(:email))
      # https://github.com/CitizenLabDotCo/citizenlab/pull/3055#discussion_r1019061643
      if @user && !authver_method.can_merge?(@user, user_attrs, params[:sso_verification])
        # `sso_flow: 'signin'` - even if user signs up, we propose to sign in due to the content of the error message
        #
        # `sso_pathname: '/'` - when sso_pathname is `/en/sign-in`, it's not redirected to /en/sign-in and the error message is not shown
        # On the FE, this hack can be tested accessing this URL
        # http://localhost:3000/authentication-error?sso_response=true&sso_flow=signin&sso_pathname=%2F&error_code=franceconnect_merging_failed
        # Note, that the modal is not shown with this URL
        # http://localhost:3000/authentication-error?sso_response=true&sso_flow=signin&sso_pathname=%2Fen%2Fsign-in&error_code=franceconnect_merging_failed
        #
        # Probaby, it would be possible to fix both issues on the FE, but it seems to be much more complicated.
        failure_redirect(error_code: authver_method.merging_error_code, sso_flow: 'signin', sso_pathname: '/')
        return
      end
    end

    if @user
      @identity.update(user: @user) unless @identity.user

      if @user.invite_pending?
        @invite = @user.invitee_invite
        if !@invite || @invite.accepted_at
          failure
          return
        end
        @user.assign_attributes(user_attrs.merge(invite_status: 'accepted'))
        ActiveRecord::Base.transaction do
          SideFxInviteService.new.before_accept @invite
          @user.save!
          @invite.save!
          SideFxInviteService.new.after_accept @invite
          signup_success_redirect
        rescue ActiveRecord::RecordInvalid => e
          ErrorReporter.report(e)
          failure
        end

      else # !@user.invite_pending?
        begin
          update_user!(auth, @user, authver_method)
        rescue ActiveRecord::RecordInvalid => e
          ErrorReporter.report(e)
          failure
          return
        end
        signin_success_redirect
      end

      set_auth_cookie(provider: provider)
      handle_verification(auth, @user) if verify

    else # New user
      @user = User.new(user_attrs)
      @user.locale = selected_locale(omniauth_params) if selected_locale(omniauth_params)

      @user.identities << @identity
      begin
        @user.save!
        SideFxUserService.new.after_create(@user, nil)
        set_auth_cookie(provider: provider)
        handle_verification(auth, @user) if verify
        signup_success_redirect
      rescue ActiveRecord::RecordInvalid => e
        Rails.logger.info "Social signup failed: #{e.message}"
        failure
      end
    end
  end

  def failure_redirect(params = {})
    redirect_params = (request.env['omniauth.params'] || {}).with_indifferent_access.merge(params)
    redirect_to(add_uri_params(Frontend::UrlService.new.signin_failure_url, redirect_params))
  end

  # NOTE: sso_flow params corrected as sometimes an sso user may start from signin but actually signup and vice versa
  def signin_success_redirect
    request.env['omniauth.params']['sso_flow'] = 'signin' if request.env['omniauth.params']['sso_flow']
    redirect_to(add_uri_params(Frontend::UrlService.new.signin_success_url(locale: @user.locale), request.env['omniauth.params']))
  end

  def signup_success_redirect
    request.env['omniauth.params']['sso_flow'] = 'signup' if request.env['omniauth.params']['sso_flow']
    redirect_to(add_uri_params(Frontend::UrlService.new.signup_success_url(locale: @user.locale), request.env['omniauth.params']))
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
      logout_supported: AuthenticationService.new.supports_logout?(provider)
    })
  end

  def set_auth_cookie(provider: nil)
    cookies[:cl2_jwt] = {
      value: auth_token(@user, provider).token,
      expires: 1.month.from_now
    }
  end

  # Updates the user with attributes from the auth response if `updateable_user_attrs` is set
  # Overwrites current attributes by default unless `overwrite_attrs?` is set to false on the authver method
  # @param [OmniauthMethods::Base] authver_method
  # @param [User] user
  def update_user!(auth, user, authver_method)
    return if authver_method.updateable_user_attrs.empty?

    attrs = authver_method.updateable_user_attrs
    update_hash = authver_method.profile_to_user_attrs(auth).slice(*attrs).compact
    update_hash.delete(:remote_avatar_url) if user.avatar.present? # don't overwrite avatar if already present
    user.confirm! # confirm user email if not already confirmed

    if authver_method.overwrite_user_attrs?
      user.update_merging_custom_fields!(update_hash)
    else
      update_hash.each_pair do |attr, value|
        user.assign_attributes(attr => value) unless user.attribute_present?(attr)
      end
      user.save!
    end
  end

  # Return locale if a locale can be parsed from pathname which matches an app locale
  # and is not the default locale, otherwise return nil.
  def selected_locale(omniauth_params)
    return unless omniauth_params['sso_pathname']

    locales = AppConfiguration.instance.settings.dig('core', 'locales')
    selected_locale = omniauth_params['sso_pathname'].split('/', 2)[1].split('/')[0]
    return selected_locale if selected_locale != locales.first && locales.include?(selected_locale)
  end

  def get_verification_method(_provider)
    nil
  end

  def handle_verification(_auth, _user)
    # overridden
  end

  def verification_callback(_verification_method)
    # overridden
  end
end

OmniauthCallbackController.prepend(Verification::Patches::OmniauthCallbackController)
