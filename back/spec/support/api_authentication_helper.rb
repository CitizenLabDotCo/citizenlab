# frozen_string_literal: true

module ApiAuthenticationHelper
  def admin_header_token
    header_token_for create(:admin)
  end

  def resident_header_token
    header_token_for create(:user)
  end

  # Authenticates the following requests as `user`, through the auth cookie the API reads.
  def header_token_for(user)
    header 'Cookie', auth_cookie(user)
  end

  def auth_cookie(user)
    token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
    "#{AuthToken::Cookie::NAME}=#{token}"
  end

  # The acceptance spec client keeps the cookies it receives, like a browser does.
  # Forgets them, as signing out would.
  def sign_out_client
    client.send(:rack_test_session).clear_cookies
  end

  # The Set-Cookie line of the auth cookie in the response, if any.
  def auth_cookie_header
    cookie_header(AuthToken::Cookie::NAME)
  end

  # The Set-Cookie line of the signed-in cookie (for the front-end) in the response, if any.
  def signed_in_cookie_header
    cookie_header(AuthToken::Cookie::SIGNED_IN_NAME)
  end

  def cookie_header(name)
    Array(response_headers['Set-Cookie']).join("\n").lines
      .find { |line| line.start_with?("#{name}=") }
  end

  # The auth token the response sets in the auth cookie, if any.
  def auth_token_from_response_cookie
    auth_cookie_header&.[](/\A#{AuthToken::Cookie::NAME}=([^;\n]+)/o, 1)
  end
end
