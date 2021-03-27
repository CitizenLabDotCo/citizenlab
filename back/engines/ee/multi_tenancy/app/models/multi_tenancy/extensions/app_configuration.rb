# frozen_string_literal: true

module MultiTenancy
  module Extensions
    module AppConfiguration
      def self.included(base)
        base.extend ClassMethods
        base.class_eval do
          attr_accessor :tenant_sync_enabled

          after_save :update_tenant, if: :tenant_sync_enabled
          after_initialize :custom_initialization
        end
      end

      # Returns the corresponding tenant.
      #
      # @return [Tenant]
      def tenant
        Tenant.find_by(id: id)
      end

      def custom_initialization
        @tenant_sync_enabled = true
      end

      def disable_tenant_sync
        self.tenant_sync_enabled = false
        self
      end

      def update_tenant
        tenant = Tenant.current
        attrs_delta = tenant.send(:attributes_delta, self, tenant)
        return if attrs_delta.blank?

        tenant.attributes = attrs_delta
        tenant.remove_logo! if logo_previously_changed? && logo.blank?
        tenant.remove_favicon! if favicon_previously_changed? && favicon.blank?
        tenant.remove_header_bg! if header_bg_previously_changed? && header_bg.blank?
        tenant.disable_config_sync.save
      end

      module ClassMethods
        # @return [Array<::AppConfiguration>]
        def of_all_tenants
          from_tenants(Tenant.all)
        end

        # @return [Array<::AppConfiguration>]
        def from_tenants(tenants)
          colnames = column_names.join(', ')
          sql_query = tenants.map(&:schema_name)
                             .map { |schema| "SELECT #{colnames} FROM \"#{schema}\".app_configurations" }
                             .join(' UNION ')

          app_configuration = ActiveRecord::Base.connection.execute(sql_query)
          app_configuration.map { |record| new(record) }
        end
      end
    end
  end
end
