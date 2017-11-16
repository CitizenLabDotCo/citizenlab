class IdentifyToSegmentJob < ApplicationJob
  queue_as :default

  def perform(user)

    traits = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      locale: user.locale,
      birthday: user.birthyear,
      gender: user.gender
    }

    begin
      tenant = Tenant.current
      traits[:tenantId] = tenant.id
      traits[:tenantName] = tenant.name
      traits[:tenantHost] = tenant.host
      traits[:tenantOrganizationType] = Tenant.settings('core', 'organization_type')
      traits[:timezone] = Tenant.settings('core', 'timezone')
    rescue  ActiveRecord::RecordNotFound => e
      # Tenant can't be found, so we don't add anything
    end

    Analytics && Analytics.identify(
      user_id: user.id,
      traits: traits
    )
  end

end
