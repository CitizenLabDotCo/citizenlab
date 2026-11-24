# frozen_string_literal: true

class UserjotIdentityService
  def configured?
    project_id.present? && secret.present?
  end

  def identity(user)
    {
      project_id:,
      signature: OpenSSL::HMAC.hexdigest('SHA256', secret, user.id)
    }
  end

  private

  def project_id
    ENV.fetch('USERJOT_PROJECT_ID', nil)
  end

  def secret
    ENV.fetch('USERJOT_PROJECT_SECRET', nil)
  end
end
