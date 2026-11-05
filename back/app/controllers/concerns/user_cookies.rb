# frozen_string_literal: true

module UserCookies
  extend ActiveSupport::Concern

  private

  # Reset the current user's JWT token after certain actions, such as password change or email change, to invalidate existing sessions.
  def reset_jwt_cookie
    return unless current_user

    current_user.expire_token!

    # Get the expiry time from the current token
    current_payload = AuthToken::AuthToken.new(token: AuthToken::Cookie.read(request)).payload

    # Set a new token with the same expiry time
    payload = current_user.to_token_payload
    payload[:exp] = current_payload['exp']

    AuthToken::Cookie.write(
      response,
      AuthToken::AuthToken.new(payload: payload).token,
      expires: Time.zone.at(current_payload['exp'])
    )
  end
end
