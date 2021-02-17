# frozen_string_literal: true

module MultiTenancy
  class TrackingTenantService
    # @param [Tenant, nil] tenant
    # @return [Hash]
    def tenant_properties(tenant = Tenant.current)
      app_config = tenant.configuration
      {
        tenantId:               tenant.id,
        tenantName:             tenant.name,
        tenantHost:             tenant.host,
        tenantOrganizationType: app_config.settings('core', 'organization_type'),
        tenantLifecycleStage:   app_config.settings('core', 'lifecycle_stage'),
      }
    end

    # @return [Hash]
    def environment_properties
      {
        cl2_cluster: CL2_CLUSTER
      }
    end
  end
end
