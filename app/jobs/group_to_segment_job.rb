class GroupToSegmentJob < ApplicationJob
  queue_as :default

  def perform(tenant)

    traits = {
      name: tenant.name,
      url: tenant.host,
      type: tenant.settings('core', 'organization_type'),
      createdAt: tenant.created_at,
      timezone: Tenant.settings('core', 'timezone')
    }
    
    Analytics && Analytics.group(
      group_id: tenant.id,
      traits: traits
    )
  end

end
