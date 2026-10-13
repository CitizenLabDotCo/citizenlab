# frozen_string_literal: true

# Signs the JWT the front end passes to the Intercom Messenger to verify the
# identity of the user (Intercom "Messenger security").
class IntercomMessengerTokenService
  TOKEN_LIFETIME = 1.hour

  # @param [User, nil] user
  # @return [Boolean]
  def issue_token?(user)
    return false unless user && secret.present?
    return false unless AppConfiguration.instance.feature_activated?('intercom')

    UserRoleService.new.moderates_something?(user)
  end

  # @param [User] user
  # @return [String]
  def token(user)
    JWT.encode(payload(user), secret, 'HS256')
  end

  private

  def payload(user)
    tenant = Tenant.current
    {
      # Must be the same id we use as +external_id+ in TrackIntercomService,
      # otherwise Intercom creates duplicate contacts.
      user_id: user.id,
      email: user.email,
      exp: TOKEN_LIFETIME.from_now.to_i,
      # Intercom ignores flat company claims, it must be a nested object.
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
