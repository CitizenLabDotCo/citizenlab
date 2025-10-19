# frozen_string_literal: true

module ApiAuthenticationHelper
  def admin_header_token
    header_token_for create(:admin)
  end

  def resident_header_token
    header_token_for create(:user)
  end

  def header_token_for(user)
    header 'Authorization', authorization_header(user)
  end

  def authorization_header(user)
    token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
    "Bearer #{token}"
  end

  def jwt_cookie(user)
    token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
    header 'Cookie', "cl2_jwt=#{token}"
  end
end
