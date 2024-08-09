# frozen_string_literal: true

module UserAuthCookie
  extend ActiveSupport::Concern
  include ActionController::Cookies

  COOKIE_NAME = :cl2_jwt
  SHORT_TOKEN_LIFETIME = 1.day
  LONG_TOKEN_LIFETIME = 1.month

  private

  def set_auth_cookie(auth_token: nil, user: nil, expires: SHORT_TOKEN_LIFETIME.from_now)
    auth_token = default_auth_token(user) if auth_token.nil?
    cookies[COOKIE_NAME] = {
      value: auth_token.token,
      expires: expires
    }
  end

  def reset_auth_cookie
    # get the expiry time from the current token
    current_token = request.headers['Authorization']&.split&.last
    current_payload = AuthToken::AuthToken.new(token: current_token).payload

    # Set a new token with the same expiry time
    payload = current_user.to_token_payload
    payload[:exp] = current_payload['exp']

    cookies[COOKIE_NAME] = {
      value: AuthToken::AuthToken.new(payload: payload).token,
      expires: Time.at(current_payload['exp'])
    }
  end

  def default_auth_token(user)
    payload = user.to_token_payload
    payload[:exp] = SHORT_TOKEN_LIFETIME.from_now.to_i
    AuthToken::AuthToken.new payload: payload
  end
end