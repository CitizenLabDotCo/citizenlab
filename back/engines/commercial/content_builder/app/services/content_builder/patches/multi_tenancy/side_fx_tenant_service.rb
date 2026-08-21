# frozen_string_literal: true

module ContentBuilder
  module Patches
    module MultiTenancy
      module SideFxTenantService
        # Once a tenant's template has been applied, give every project its page and
        # every folder its description on the Content Builder — templates carry no
        # layouts of their own. Errors are reported but swallowed so provisioning can
        # never abort tenant creation.
        def after_apply_template(tenant, template, current_user = nil)
          super
          begin
            tenant.switch { ContentBuilder::LayoutProvisioningService.new.provision_all! }
          rescue StandardError => e
            ErrorReporter.report(e, extra: { tenant_id: tenant.id })
          end
        end
      end
    end
  end
end
