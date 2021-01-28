class TrackTenantJob < ApplicationJob
  queue_as :default
  # creates or updates tenants in tracking destinations, should be called every tenant change

  # @param [Tenant] tenant
  def perform(tenant)
    TrackIntercomService.new.identify_tenant(tenant) if AppConfiguration.instance.has_feature?('intercom')
    TrackSegmentService.new.identify_tenant(tenant) if AppConfiguration.instance.has_feature?('segment')
  end
end
