# frozen_string_literal: true

module MultiTenancy
  class ApplyTenantTemplateJob < ApplicationJob
    queue_as :default
    perform_retries false

    def run(template, tenant)
      side_fx_tenant = MultiTenancy::SideFxTenantService.new

      # `perform_retries false` only applies when the job raises. When the worker process
      # dies mid-apply (deploy, scale-in, crash), Que runs the job again. Applying the
      # template a second time on the half-built tenant duplicates records and fails on
      # the first unique constraint, so we stop here and report the interruption instead.
      if tenant.template_application_started_at
        side_fx_tenant.after_interrupted_apply_template(tenant, template)
        return
      end

      # Written outside of any transaction, so the marker survives the process being killed.
      tenant.update_column(:template_application_started_at, Time.zone.now)

      side_fx_tenant.before_apply_template(tenant, template)
      side_fx_tenant.around_apply_template(tenant, template) do
        tenant.switch { MultiTenancy::Templates::ApplyService.new.apply(template) }
      end
      side_fx_tenant.after_apply_template(tenant, template)
    end
  end
end
