class ApplyTenantTemplateJob < ApplicationJob
  queue_as :default
  perform_retries false

  def run template, tenant
    Apartment::Tenant.switch(tenant.schema_name) do
      TenantTemplateService.new.resolve_and_apply_template template, external_subfolder: 'release'
    end
    SideFxTenantService.new.after_apply_template tenant, nil
  end
end
