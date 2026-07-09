# frozen_string_literal: true

module ContentBuilder
  module Patches
    module MultiTenancy
      module SideFxTenantService
        # Once a tenant's template has been applied, put every project/folder
        # description on the Content Builder. Errors are reported but swallowed so
        # provisioning can never abort tenant creation.
        def after_apply_template(tenant, template, current_user = nil)
          super
          begin
            tenant.switch { ContentBuilder::DescriptionLayoutService.new.provision_all_descriptions! }
          rescue StandardError => e
            ErrorReporter.report(e, extra: { tenant_id: tenant.id })
          end
        end
      end
    end
  end
end
