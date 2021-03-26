module TenantHelper
  def organization_name
    Tenant.current.settings.dig('core', 'organization_name', 'en')
  end
end
