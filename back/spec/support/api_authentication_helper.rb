# frozen_string_literal: true

module ApiAuthenticationHelper
  def admin_header_token
    header_token_for create(:admin)
  end

  def resident_header_token
    header_token_for create(:user)
  end

  def header_token_for(user)
    token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end
end
