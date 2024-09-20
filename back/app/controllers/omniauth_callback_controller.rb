# frozen_string_literal: true

class OmniauthCallbackController < ApplicationController
  include ActionController::Cookies
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized

  def create
    if auth_method
      auth_callback
    else
      raise "#{auth['provider']} not supported"
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

  def auth_callback
    user_attrs = auth_method.profile_to_user_attrs(auth)
    @identity = Identity.find_or_build_with_omniauth(auth, auth_method)
    @user = @identity.user || find_existing_user(user_attrs)
    @user = authentication_service.prevent_user_account_hijacking @user

    # TODO: JS - Not finding the user even though it is there - @identity has no user

    # For FranceConnect only: https://github.com/CitizenLabDotCo/citizenlab/pull/3055#discussion_r1019061643
    if @user && !auth_method.can_merge?(@user, user_attrs, params[:sso_verification])
      # `sso_flow: 'signin'` - even if user signs up, we propose to sign in due to the content of the error message
      signin_failure_redirect(error_code: auth_method.merging_error_code, sso_flow: 'signin')
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
          @invite.save!
          SideFxInviteService.new.after_accept @invite
          sign_in(sign_up: true)
        rescue ActiveRecord::RecordInvalid => e
          ErrorReporter.report(e)
          signin_failure_redirect
        end

      else # !@user.invite_pending?
        begin
          update_user!
        rescue ActiveRecord::RecordInvalid => e
          ErrorReporter.report(e)
          signin_failure_redirect
          return
        end
        sign_in(sign_up: false)
      end

    else # New user
      confirm = auth_method.email_confirmed?(auth)
      user_locale = get_user_locale(user_attrs)

      @user = UserService.build_in_sso(user_attrs, confirm, user_locale)

      @user.identities << @identity
      begin
        @user.save!
        SideFxUserService.new.after_create(@user, nil)
        sign_in(sign_up: true, user_created: true)
      rescue ActiveRecord::RecordInvalid => e
        Rails.logger.info "Social signup failed: #{e.message}"
        signin_failure_redirect
      end
    end
  end

  def find_existing_user(user_attrs)
    user = User.find_by_cimail(user_attrs.fetch(:email)) if user_attrs.key?(:email) # some providers don't return email
    user
  end

  def sign_in(sign_up: true, user_created: false)
    set_auth_cookie(provider: auth['provider'])
    if sign_up
      signup_success_redirect
    else
      signin_success_redirect
    end
  end

  # NOTE: sso_flow params corrected as sometimes an sso user may start from signin but actually signup and vice versa
  def signin_success_redirect
    params = filter_omniauth_params
    params['sso_flow'] = 'signin' if params['sso_flow']
    redirect_to(
      add_uri_params(
        Frontend::UrlService.new.sso_return_url(pathname: sso_redirect_path, locale: Locale.new(@user.locale)),
        params
      )
    )
  end

  def signup_success_redirect
    params = filter_omniauth_params
    params['sso_flow'] = 'signup' if params['sso_flow']
    redirect_to(
      add_uri_params(
        Frontend::UrlService.new.sso_return_url(pathname: sso_redirect_path, locale: Locale.new(@user.locale)),
        params
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
    omniauth_params&.except('token', 'pathname', 'sso_pathname') || {}
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
      expires: 1.month.from_now
    }
  end

  # Updates the user with attributes from the auth response if `updateable_user_attrs` is set
  # Overwrites current attributes by default unless `overwrite_attrs?` is set to false on the authver method
  # @param [User] user
  def update_user!
    attrs = auth_method.updateable_user_attrs
    sso_user_attrs = auth_method.profile_to_user_attrs(auth)
    user_params = sso_user_attrs.slice(*attrs).compact
    user_params.delete(:remote_avatar_url) if @user.avatar.present? # don't overwrite avatar if already present

    sso_email_is_used = sso_user_attrs[:email].present? && (sso_user_attrs[:email] == (user_params[:email] || @user.email))
    confirm_user = auth_method.email_confirmed?(auth) && sso_email_is_used

    UserService.update_in_sso!(@user, user_params, confirm_user)
  end

  # Return locale if a locale can be parsed from pathname which matches an app locale
  # and is not the default locale.
  # If that fails, return the locale returned by the SSO provider.
  # If that also fails, just return the default locale.
  def get_user_locale(user_attrs)
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

  def auth
    @auth ||= request.env['omniauth.auth']
  end

  def auth_method
    @auth_method ||= authentication_service.method_by_provider(auth['provider'])
  end

  def omniauth_params
    @omniauth_params || request.env['omniauth.params']
  end
end

OmniauthCallbackController.prepend(Verification::Patches::OmniauthCallbackController)
