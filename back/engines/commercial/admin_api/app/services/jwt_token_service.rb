class JwtTokenService
  def request_token(user)
    payload = user.to_token_payload
    payload[:exp] = 30.minutes.from_now.to_i
    AuthToken::AuthToken.new(payload:).token
  end
end
