# frozen_string_literal: true

# Signs users in and out. The auth token is handed out in an HttpOnly cookie only:
# it never appears in a response body, so the front-end has no access to it.
class WebApi::V1::UserTokenController < ActionController::API
  include ActionController::Cookies
  include EnforceUserSso

  before_action :sso_enforced?, only: %i[create]

  # Email address + password
  def create
    user = User.not_invited.find_by_cimail(auth_params[:email])

    # `confirmation_required` is only ever cleared together with `email_confirmed_at`,
    # so it tells us whether this email address was confirmed.
    return head :not_found unless user && !user.confirmation_required? && password_correct?(user)

    handle_successful_authentication_sidefx(user)
    sign_in(user)
  end

  # Phone number + password
  def create_phone
    return head :not_found unless AppConfiguration.instance.feature_activated?('sms')

    user = User.not_invited.find_by_phone_number(auth_params[:phone])

    return head :not_found unless user&.phone_confirmed_at && password_correct?(user)

    handle_successful_authentication_sidefx(user)
    sign_in(user)
  end

  # Sign out. Users signed in through an SSO provider that supports logout must also
  # be signed out there, so the URL to send them to is returned when there is one.
  def destroy
    logout_url = sso_logout_url
    AuthToken::Cookie.clear(response)

    if logout_url
      render json: { logout_url: logout_url }
    else
      head :no_content
    end
  end

  private

  def sign_in(user)
    remember_me = auth_params[:remember_me] == true
    expires_at = token_lifetime(remember_me).from_now

    payload = user.to_token_payload
    payload[:exp] = expires_at.to_i
    token = AuthToken::AuthToken.new(payload: payload).token

    # The cookie lives as long as the token: 1 day, or longer with remember_me.
    AuthToken::Cookie.write(response, token, expires: expires_at)
    head :created
  end

  def sso_logout_url
    token = AuthToken::Cookie.read(request)
    return unless token

    payload = AuthToken::AuthToken.new(token: token).payload
    return unless payload['logout_supported'] && payload['provider']

    user = User.find_by(id: payload['sub'])
    AuthenticationService.new.logout_url(payload['provider'], user) if user
  rescue JWT::DecodeError
    nil
  end

  def handle_successful_authentication_sidefx(user)
    ClaimTokenService.claim(user, auth_params[:claim_tokens])
    IdeaExposureTransferService.new.transfer_from_request(user: user, request: request)
  end

  def password_correct?(user)
    password = auth_params[:password]

    password.present? && user.authenticate(password).present?
  end

  def token_lifetime(remember_me)
    return AuthToken::AuthToken::TOKEN_SHORT_LIFETIME unless remember_me

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
