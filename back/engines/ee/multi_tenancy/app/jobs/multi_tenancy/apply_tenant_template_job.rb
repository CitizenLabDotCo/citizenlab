module MultiTenancy
  class ApplyTenantTemplateJob < ApplicationJob
    queue_as :default
    perform_retries false

    def run template, tenant
      MultiTenancy::SideFxTenantService.new.before_apply_template tenant, template
      Apartment::Tenant.switch(tenant.schema_name) do
        ::MultiTenancy::TenantTemplateService.new.resolve_and_apply_template template, external_subfolder: 'release'
      end
      MultiTenancy::SideFxTenantService.new.after_apply_template tenant, template
    end
  end
end
