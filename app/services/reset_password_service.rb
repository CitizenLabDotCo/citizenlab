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

  def log_password_reset_to_segment user, token
    IdentifyToSegmentJob.perform_later(user)
    LogActivityJob.set(wait: 2.seconds).perform_later(user, 'requested password reset', user, Time.now.to_i, payload: {url: "#{Tenant.current.base_frontend_uri}/reset-password?token=#{token}", user_email: user.email})
  end

end