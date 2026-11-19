# frozen_string_literal: true

module UserCookies
  extend ActiveSupport::Concern

  private

  # The URL to sign the user out at the SSO provider they signed in with, if that
  # provider supports it. Needs the user, so look it up before deleting them.
  def sso_logout_url
    token = AuthToken::Cookie.read(request)
    return unless token

    payload = AuthToken::AuthToken.new(token: token).payload
    return unless payload['logout_supported'] && payload['provider']

    user = User.find_by(id: payload['sub'])
    AuthenticationService.new.logout_url(payload['provider'], user) if user
  rescue JWT::DecodeError
    nil
  rescue StandardError => e
    # Signing out or deleting the account must not fail because the logout URL can't be built.
    ErrorReporter.report(e)
    nil
  end

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
