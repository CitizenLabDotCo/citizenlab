# frozen_string_literal: true

module MultiTenancy
  module Extensions
    module AppConfiguration
      def self.included(base)
        base.extend ClassMethods
        base.class_eval do
          attr_accessor :tenant_sync_enabled

          validate :validate_lifecycle_stage_change, on: :update
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

      def without_tenant_sync
        self.tenant_sync_enabled = false
        yield self
      ensure
        self.tenant_sync_enabled = true
      end

      def update_tenant
        tenant = Tenant.current
        app_config = ::AppConfiguration.instance
        attrs_delta = tenant.send(:attributes_delta, app_config, tenant)

        return if attrs_delta.blank?

        tenant.attributes = attrs_delta
        tenant.without_config_sync(&:save)
      end

      def validate_lifecycle_stage_change
        return unless settings_changed?

        prev_demo = settings_was.dig('core', 'lifecycle_stage') == 'demo'
        currently_demo = settings.dig('core', 'lifecycle_stage') == 'demo'
        return if prev_demo == currently_demo

        errors.add(
          :settings,
          'The lifecycle stage cannot be changed from or to "demo". Demo platforms cannot become the final platforms; instead a new tenant should be created.'
        )
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
          app_configuration.map { |record| instantiate(record) }
        end
      end
    end
  end
end
