# frozen_string_literal: true

module MultiTenancy
  module Patches
    module ApplicationController
      def self.prepended(base)
        base.class_eval do
          before_action :set_current_tenant
          before_action :set_sentry_context
          rescue_from Apartment::TenantNotFound, with: :tenant_not_found
        end
      end

      def set_current_tenant
        Current.tenant = Tenant.current
      rescue ActiveRecord::RecordNotFound
        # Ignored
      end

      def set_sentry_context
        Sentry.set_tags(tenant: Current.tenant&.host)
        Sentry.set_user(id: current_user.id) if current_user
      end

      def tenant_not_found
        head 404
      end
    end
  end
end

ApplicationController.prepend(MultiTenancy::Patches::ApplicationController)
