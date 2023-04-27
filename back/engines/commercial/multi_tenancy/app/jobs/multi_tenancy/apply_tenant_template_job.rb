# frozen_string_literal: true

module MultiTenancy
  class ApplyTenantTemplateJob < ApplicationJob
    queue_as :default
    perform_retries false

    def run(template, tenant)
      side_fx_tenant = MultiTenancy::SideFxTenantService.new

      side_fx_tenant.before_apply_template(tenant, template)
      side_fx_tenant.around_apply_template(tenant, template) do
        tenant.switch { MultiTenancy::Templates::ApplyService.new.apply(template) }
      end
      side_fx_tenant.after_apply_template(tenant, template)
    end
  end
end
