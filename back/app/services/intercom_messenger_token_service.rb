# frozen_string_literal: true

class IntercomMessengerTokenService
  # Force BE redeploy
  TOKEN_LIFETIME = 1.hour

  def configured?
    secret.present?
  end

  def token(user)
    JWT.encode(payload(user), secret, 'HS256')
  end

  private

  def payload(user)
    tenant = Tenant.current
    {
      user_id: user.id,
      email: user.email,
      exp: TOKEN_LIFETIME.from_now.to_i,
      company: {
        company_id: tenant.id,
        name: tenant.name,
        **MultiTenancy::TrackingTenantService.new.tenant_properties(tenant)
      }
    }
  end

  def secret
    ENV.fetch('INTERCOM_MESSENGER_SECRET', nil)
  end
end
