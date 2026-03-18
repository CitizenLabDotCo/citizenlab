# frozen_string_literal: true

module UpdateUserToken
  extend ActiveSupport::Concern

  private

  # Reset the current user's JWT token after certain actions, such as password change or email change, to invalidate existing sessions.
  def reset_jwt_cookie
    return unless current_user

    current_user.expire_token!

    # Get the expiry time from the current token
    current_token = request.headers['Authorization']&.split&.last
    current_payload = AuthToken::AuthToken.new(token: current_token).payload

    # Set a new token with the same expiry time
    payload = current_user.to_token_payload
    payload[:exp] = current_payload['exp']

    cookies[:cl2_jwt] = {
      value: AuthToken::AuthToken.new(payload: payload).token,
      expires: Time.at(current_payload['exp'])
    }
  end
end
