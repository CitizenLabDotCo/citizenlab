# frozen_string_literal: true
module MultiTenancy
  class TenantService
    def initialize_tenant
      raise NotImplementedError
    end
    
    def update_tenant
      raise NotImplementedError
    end

    def self.serialize_tenants(tenants = nil)
      tenants ||= Tenant.all
      configs = AppConfiguration.from_tenants(tenants)

      tenants.zip(configs).map do |tenant, config|
        WebApi::V1::External::TenantSerializer.new(tenant, app_configuration: config)
      end
    end
  end
end
