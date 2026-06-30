# frozen_string_literal: true

module ContentBuilder
  module Patches
    module MultiTenancy
      module SideFxTenantService
        # Once a tenant's template has been applied, put every project/folder
        # description on the Content Builder — covering templates (of any origin)
        # whose projects carry a WYSIWYG description but no builder layout.
        #
        # Provisioning is reported-but-swallowed so it can never abort tenant
        # creation; `super`'s own errors are left to propagate.
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
