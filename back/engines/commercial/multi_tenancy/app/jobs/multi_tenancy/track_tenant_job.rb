# frozen_string_literal: true

module MultiTenancy
  class TrackTenantJob < ApplicationJob
    queue_as :default
    # creates or updates tenants in tracking destinations, should be called every tenant change

    # @param [Tenant] tenant
    def run(tenant)
      app_config = AppConfiguration.instance
      TrackIntercomService.new.identify_tenant(tenant) if app_config.feature_activated?('intercom')
      TrackSegmentService.new.identify_tenant(tenant)  if app_config.feature_activated?('segment')
    end
  end
end
