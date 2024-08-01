# frozen_string_literal: true

module UserAuthCookie
  extend ActiveSupport::Concern
  include ActionController::Cookies

  COOKIE_NAME = :cl2_jwt

  private

  # TODO: JS - Get this working for both SSO and ominauth
  # TODO: Add expiration time to the token
  def set_auth_cookie(auth_token, expires: 1.month.from_now)
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
end