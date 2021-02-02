TrackSegmentService.setup do |config|
  config.user_traits_builder = lambda do |user|
    TrackSegmentService::Helpers
      .default_user_traits(user)
      .merge(MultiTenancy::TrackingTenantService.new.tenant_properties)
  end

  config.activity_traits_builder = lambda do |activity|
    tenant_tracker = MultiTenancy::TrackingTenantService.new
    TrackSegmentService::Helpers
      .default_activity_traits(activity)
      .merge(tenant_tracker.environment_properties)
      .merge(tenant_tracker.tenant_properties)
  end

  config.tenant_traits_builder = lambda do |tenant|
    configuration = tenant.configuration
    {
      name: tenant.name,
      website: "https://#{tenant.host}",
      createdAt: tenant.created_at,
      avatar: configuration.logo&.medium&.url,
      tenantLocales: configuration.settings('core', 'locales'),
      **MultiTenancy::TrackingTenantService.new.tenant_properties(tenant)
    }
  end
end

