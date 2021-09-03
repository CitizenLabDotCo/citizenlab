# frozen_string_literal: true

class OmniauthCallbackController < ApplicationController
  include ActionController::Cookies
  skip_after_action :verify_authorized

  def create
    auth_provider = request.env.dig('omniauth.auth', 'provider')
    auth_method = AuthenticationService.new.method_by_provider(auth_provider)
    verification_method = get_verification_method(auth_provider)

    if auth_method
      auth_callback(verify: verification_method, authver_method: auth_method)
    elsif verification_method
      verification_callback(verification_method)
    else
      raise "#{auth_provider} not supported"
    end
  end

  def auth_callback(verify:, authver_method:)
    auth = request.env['omniauth.auth']
    omniauth_params = request.env['omniauth.params']
    provider = auth['provider']

    @identity = Identity.find_with_omniauth(auth) || Identity.create_with_omniauth(auth)
    @user = @identity.user || User.find_by_cimail(auth.info.email)

    if @user
      @identity.update(user: @user) unless @identity.user

      if @user.invite_pending?
        @invite = @user.invitee_invite
        if !@invite || @invite.accepted_at
          failure
          return
        end
        @user.assign_attributes(authver_method.profile_to_user_attrs(auth).merge(invite_status: 'accepted'))
        ActiveRecord::Base.transaction do
          SideFxInviteService.new.before_accept @invite
          @user.save!
          @invite.save!
          SideFxInviteService.new.after_accept @invite
          redirect_to(add_uri_params(Frontend::UrlService.new.signup_success_url(locale: @user.locale), omniauth_params))
        rescue ActiveRecord::RecordInvalid => e
          Raven.capture_exception e
          failure
          return
        end

      else # !@user.invite_pending?
        begin
          update_user!(auth, @user, authver_method)
        rescue ActiveRecord::RecordInvalid => e
          Raven.capture_exception e
          failure
          return
        end
        redirect_to(add_uri_params(Frontend::UrlService.new.signin_success_url(locale: @user.locale), omniauth_params))
      end

      set_auth_cookie(provider: provider)
      handle_verification(auth, @user) if verify

    else # New user
      @user = User.new(authver_method.profile_to_user_attrs(auth))
      @user.locale = selected_locale(omniauth_params) if selected_locale(omniauth_params)

      SideFxUserService.new.before_create(@user, nil)
      @user.identities << @identity
      begin
        @user.save!
        SideFxUserService.new.after_create(@user, nil)
        set_auth_cookie(provider: provider)
        handle_verification(auth, @user) if verify
        redirect_to(add_uri_params(Frontend::UrlService.new.signup_success_url(locale: @user.locale), omniauth_params))
      rescue ActiveRecord::RecordInvalid => e
        Rails.logger.info "Social signup failed: #{e.message}"
        redirect_to(add_uri_params(Frontend::UrlService.new.signin_failure_url, omniauth_params))
      end
    end
  end

  def failure
    omniauth_params = request.env['omniauth.params']
    redirect_to(add_uri_params(Frontend::UrlService.new.signin_failure_url, omniauth_params))
  end

  def logout
    provider = params[:provider]
    user_id = params[:user_id]
    user = User.find(user_id)
    auth_service = AuthenticationService.new

    url = auth_service.logout_url(provider, user)

    redirect_to url
  rescue ActiveRecord::RecordNotFound => e
    redirect_to Frontend::UrlService.new.home_url
  end

  def secure_controller?
    false
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

    Knock::AuthToken.new payload: payload.merge({
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

  def update_user!(auth, user, authver_method)
    if authver_method.respond_to? :updateable_user_attrs
      attrs = authver_method.updateable_user_attrs
      update_hash = authver_method.profile_to_user_attrs(auth).slice(*attrs).compact
      user.update!(update_hash)
    end
  end

  private

  # Return locale if a locale can be parsed from pathname which matches an app locale
  # and is not the default locale, otherwise return nil. 
  def selected_locale(omniauth_params)
    locales = AppConfiguration.instance.settings.dig('core', 'locales')

    if omniauth_params['sso_pathname']
      selected_locale = omniauth_params['sso_pathname'].split('/', 2)[1].split('/')[0]
      return selected_locale if selected_locale != locales.first && locales.include?(selected_locale)
    end
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

OmniauthCallbackController.prepend_if_ee('Verification::Patches::OmniauthCallbackController')
