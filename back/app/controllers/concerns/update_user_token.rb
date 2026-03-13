# frozen_string_literal: true

module UpdateUserToken
  extend ActiveSupport::Concern

  private

  # Reset the user's JWT token after certain actions, such as password change or email change, to invalidate existing sessions.
  def reset_token(user)
    user.expire_token!
    return unless user == current_user # Only reset the cookie for the current user, not for admin actions on other users

    # Get the expiry time from the current token
    current_token = request.headers['Authorization']&.split&.last
    current_payload = AuthToken::AuthToken.new(token: current_token).payload

    # Set a new token with the same expiry time
    payload = user.to_token_payload
    payload[:exp] = current_payload['exp']

    cookies[:cl2_jwt] = {
      value: AuthToken::AuthToken.new(payload: payload).token,
      expires: Time.at(current_payload['exp'])
    }
  end
end
