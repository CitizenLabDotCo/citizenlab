# frozen_string_literal: true

module ContentBuilder
  module Patches
    module MultiTenancy
      module SideFxTenantService
        # A template carries only the layouts its source platform had, so fill in the rest.
        # Errors are swallowed so provisioning can never abort tenant creation.
        def after_apply_template(tenant, template, current_user = nil)
          super
          begin
            tenant.switch do
              service = ContentBuilder::DescriptionLayoutService.new
              service.provision_all_descriptions!
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
