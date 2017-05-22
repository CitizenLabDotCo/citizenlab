require 'jwt'

class ResetPasswordService

  def generate_reset_password_token user
    payload = {
      id: user.id,
      exp: (Time.now+1.hour).to_i
    }

    JWT.encode payload, secret, 'HS256'
  end

  def token_valid? user, token
    begin
      payload = JWT.decode token, secret, true, { algorithm: 'HS256'}
      payload[0]["id"] == user.id
    rescue JWT::ExpiredSignature
      return false
    end
  end

  def secret
    Rails.application.secrets.secret_key_base
  end
end