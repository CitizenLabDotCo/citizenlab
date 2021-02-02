
TrackSegmentService.setup do |config|
  config.user_traits_getters = lambda do |user|
    TrackSegmentService::Helpers
      .default_user_traits(user)
      .merge(TrackingService.new.tenant_properties)
  end

  config.activity_traits_builder = lambda do |activity|
    tracking_service = TrackingService.new
    TrackSegmentService::Helpers
      .default_activity_traits(activity)
      .merge(tracking_service.activity_properties(activity))
      .merge(tracking_service.environment_properties)
  end

  config.tenant_traits_getters = lambda do |tenant|
    configuration = tenant.configuration
    {
      name: tenant.name,
      website: "https://#{tenant.host}",
      createdAt: tenant.created_at,
      avatar: configuration.logo&.medium&.url,
      tenantLocales: configuration.settings('core', 'locales'),
      **TrackingService.new.tenant_properties(tenant)
    }
  end
end

