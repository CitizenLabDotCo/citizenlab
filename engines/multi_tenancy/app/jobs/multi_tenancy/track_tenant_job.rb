# frozen_string_literal: true

module MultiTenancy
  class TrackTenantJob < ApplicationJob
    queue_as :default
    # creates or updates tenants in tracking destinations, should be called every tenant change

    # @param [Tenant] tenant
    def run(tenant)
      TrackIntercomService.new.identify_tenant(tenant) if AppConfiguration.instance.has_feature?('intercom')
      TrackSegmentService.new.identify_tenant(tenant) if AppConfiguration.instance.has_feature?('segment')
    end
  end
end
