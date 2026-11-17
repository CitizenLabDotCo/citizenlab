# frozen_string_literal: true

module ContentBuilder
  module Patches
    module MultiTenancy
      module SideFxTenantService
        # Once a tenant's template has been applied, give every project its page, every folder its
        # description, and every static page whose code is in StaticPage::CONTENT_BUILDER_CODES its
        # layout. Policy pages are outside that set and render through the static page sections.
        # Errors are reported but swallowed so provisioning can never abort tenant creation.
        def after_apply_template(tenant, template, current_user = nil)
          super
          begin
            tenant.switch do
              service = ContentBuilder::LayoutProvisioningService.new
              service.provision_all!
              service.provision_all_custom_pages!
            end
          rescue StandardError => e
            ErrorReporter.report(e, extra: { tenant_id: tenant.id })
          end
        end
      end
    end
  end
end
