class IdentifyToSegmentJob < ApplicationJob
  queue_as :default

  def perform(user, options: {})
    traits = {}
    user_id = nil
    if options[:invited_user]
      user_id = options[:invited_user][:id]
      traits = {
        id: user_id,
        email: options[:invited_user][:email]
      }
    else
      user_id = user.id
      traits = {
        id: user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        locale: user.locale,
        birthday: user.birthyear,
        gender: user.gender,
        is_admin: user.admin?
      }
    end

    tenant_id = nil

    begin
      tenant = Tenant.current
      tenant_id = tenant.id
      traits[:tenantId] = tenant.id
      traits[:tenantName] = tenant.name
      traits[:tenantHost] = tenant.host
      traits[:tenantOrganizationType] = Tenant.settings('core', 'organization_type')
      traits[:timezone] = Tenant.settings('core', 'timezone')
    rescue  ActiveRecord::RecordNotFound => e
      # Tenant can't be found, so we don't add anything
    end

    Analytics && Analytics.identify(
      user_id: user_id,
      traits: traits
    )
    Analytics && Analytics.group(
      user_id: user_id,
      group_id: tenant_id,
      traits: {
        name: traits[:tenantName],
        host: traits[:tenantHost],
        type: traits[:tenantOrganizationType]
      }
    )
  end

end
