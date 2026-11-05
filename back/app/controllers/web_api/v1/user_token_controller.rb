# frozen_string_literal: true

class WebApi::V1::UserTokenController < ActionController::API
  include ActionController::Cookies
  include EnforceUserSso

  COOKIE_NAME = :cl2_jwt

  before_action :sso_enforced?, only: %i[create]

  # Email address + password
  def create
    user = User.not_invited.find_by_cimail(auth_params[:email])

    # `confirmation_required` is only ever cleared together with `email_confirmed_at`,
    # so it tells us whether this email address was confirmed.
    return head :not_found unless user && !user.confirmation_required? && password_correct?(user)

    handle_successful_authentication_sidefx(user)
    render_auth_token(user)
  end

  # Phone number + password
  def create_phone
    return head :not_found unless AppConfiguration.instance.feature_activated?('sms')

    user = User.not_invited.find_by_phone_number(auth_params[:phone])

    return head :not_found unless user&.phone_confirmed_at && password_correct?(user)

    handle_successful_authentication_sidefx(user)
    render_auth_token(user)
  end

  # Sign out: clear the HttpOnly JWT cookie by making it expire immediately.
  def destroy
    response.set_cookie(COOKIE_NAME, {
      value: '',
      expires: 1.second.ago,
      path: '/',
      httponly: true,
      secure: true,
      same_site: :strict
    })

    head :no_content
  end

  private

  def render_auth_token(user)
    lifetime = token_lifetime
    auth_token = auth_token(user, lifetime)

    # Use response.set_cookie, not `cookies[:cl2_jwt] =`, to bypass middleware
    # dependency to ensure reliable HttpOnly flag setting in API-only Rails apps
    response.set_cookie(COOKIE_NAME, {
      value: auth_token.token,
      httponly: true,
      secure: true,
      same_site: :strict,
      expires: lifetime.from_now,
      path: '/'
    })

    render json: auth_token, status: :created
  end

  def handle_successful_authentication_sidefx(user)
    ClaimTokenService.claim(user, auth_params[:claim_tokens])
    IdeaExposureTransferService.new.transfer_from_request(user: user, request: request)
  end

  def password_correct?(user)
    password = auth_params[:password]

    password.present? && user.authenticate(password).present?
  end

  def auth_token(user, lifetime)
    payload = user.to_token_payload

    # TODO: This can probably be removed, since the FE no longer needs it,
    # but leaving it for now to avoid any potential issues with other services.
    payload[:exp] = lifetime.from_now.to_i

    AuthToken::AuthToken.new payload: payload
  end

  def token_lifetime
    return AuthToken::AuthToken::TOKEN_SHORT_LIFETIME unless auth_params[:remember_me] == true

    max_lifetime = AppConfiguration.instance.settings.dig('core', 'authentication_token_lifetime_in_days')
    max_lifetime.present? ? max_lifetime.to_i.days : AuthToken::AuthToken::TOKEN_DEFAULT_LIFETIME
  end

  def auth_params
    @auth_params ||= params.require(:auth).permit(:email, :phone, :password, :remember_me, claim_tokens: [])
  end

  def email_param
    params.dig(:auth, :email)
  end
end
