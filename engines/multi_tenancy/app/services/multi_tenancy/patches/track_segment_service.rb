# frozen_string_literal: true

module MultiTenancy
  module Patches
    module TrackSegmentService
      def user_traits(user)
        super.merge(TrackingTenantService.new.tenant_properties)
      end

      def activity_traits(activity)
        tenant_tracker = TrackingTenantService.new
        super.merge(tenant_tracker.environment_properties)
             .merge(tenant_tracker.tenant_properties)
      end

      def tenant_traits(tenant)
        configuration = tenant.configuration
        {
          name: tenant.name,
          website: "https://#{tenant.host}",
          createdAt: tenant.created_at,
          avatar: configuration.logo&.medium&.url,
          tenantLocales: configuration.settings('core', 'locales'),
          **TrackingTenantService.new.tenant_properties(tenant)
        }
      end
    end
  end
end

TrackSegmentService.prepend(MultiTenancy::Patches::TrackSegmentService)
