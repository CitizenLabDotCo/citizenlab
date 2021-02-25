# frozen_string_literal: true

module MultiTenancy
  module Patches
    module ApplicationController
      def self.prepended(base)
        base.class_eval do
          before_action :set_current_tenant
          rescue_from Apartment::TenantNotFound, with: :tenant_not_found
        end
      end

      def set_current_tenant
        Current.tenant = Tenant.current
      rescue ActiveRecord::RecordNotFound
        # Ignored
      end

      def tenant_not_found
        head 404
      end
    end
  end
end

ApplicationController.prepend(MultiTenancy::Patches::ApplicationController)
