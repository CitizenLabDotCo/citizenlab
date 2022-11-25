# frozen_string_literal: true

module MultiTenancy
  class ApplyTenantTemplateJob < ApplicationJob
    queue_as :default
    perform_retries false

    def run(template, tenant)
      side_fx_tenant = MultiTenancy::SideFxTenantService.new

      side_fx_tenant.before_apply_template tenant, template
      side_fx_tenant.around_apply_template(tenant, template) do
        Apartment::Tenant.switch(tenant.schema_name) do
          ::MultiTenancy::TenantTemplateService.new.resolve_and_apply_template template, external_subfolder: 'release'
        end
      end
      side_fx_tenant.after_apply_template tenant, template
    end
  end
end
