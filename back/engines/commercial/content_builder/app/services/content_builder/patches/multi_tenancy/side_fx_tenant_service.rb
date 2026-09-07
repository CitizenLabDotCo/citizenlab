# frozen_string_literal: true

module ContentBuilder
  module Patches
    module MultiTenancy
      module SideFxTenantService
        # Once a tenant's template has been applied, give every project its page, every
        # folder its description and every custom page its layout on the Content Builder —
        # templates carry no layouts of their own. Errors are reported but swallowed so
        # provisioning can never abort tenant creation.
        def after_apply_template(tenant, template, current_user = nil)
          super
          begin
            tenant.switch do
              service = ContentBuilder::LayoutProvisioningService.new
              service.provision_all!
              # Temporary gate: nothing reads a layout while the feature is off, so write none.
              if AppConfiguration.instance.feature_activated?('custom_page_builder')
                service.provision_all_custom_pages!
              end
            end
          rescue StandardError => e
            ErrorReporter.report(e, extra: { tenant_id: tenant.id })
          end
        end
      end
    end
  end
end
