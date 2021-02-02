require 'pry' ; binding.pry
TrackIntercomService.setup do |config|

  config.user_attributes_builder = lambda do |user|
    TrackIntercomService::Helpers
      .default_user_attributes(user)
      .merge(MultiTenancy::TrackingTenantService.new.tenant_properties)
  end

  config.activity_attributes_builder = lambda do |activity|
    tracking_service = MultiTenancy::TrackingTenantService.new
    TrackIntercomService::Helpers
      .default_activity_attributes(activity)
      .merge(tracking_service.tenant_properties)
      .merge(tracking_service.environment_properties)
  end

  config.tenant_attributes_builder = MultiTenancy::TrackingTenantService.new.method(:tenant_properties)
end
