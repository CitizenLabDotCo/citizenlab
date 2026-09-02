# frozen_string_literal: true

module ContentBuilder
  module Patches
    module MultiTenancy
      module SideFxTenantService
        # Transitional. A template generated from a platform that predates the migration
        # carries projects, folders and custom pages with no layout; once every platform is
        # migrated this finds nothing, and it retires with the migration task. Errors are
        # swallowed so provisioning can never abort tenant creation.
        def after_apply_template(tenant, template, current_user = nil)
          super
          begin
            tenant.switch do
              service = ContentBuilder::DescriptionLayoutService.new
              service.provision_all_descriptions!
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
