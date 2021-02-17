# frozen_string_literal: true

module MultiTenancy
  module Extensions
    module AppConfiguration
      def self.included(base)
        base.extend ClassMethods
      end

      # Returns the corresponding tenant.
      #
      # @return [Tenant]
      def tenant
        Tenant.find_by(id: id)
      end

      module ClassMethods
        # @return [Array<::AppConfiguration>]
        def of_all_tenants
          from_tenants(Tenant.all)
        end

        # @return [Array<::AppConfiguration>]
        def from_tenants(tenants)
          sql_query = tenants.map(&:schema_name)
                             .map { |schema| "SELECT * FROM \"#{schema}\".app_configurations" }
                             .join(' UNION ')

          app_configuration = ActiveRecord::Base.connection.execute(sql_query)
          app_configuration.map { |record| new(record) }
        end
      end
    end
  end
end

AppConfiguration.include(MultiTenancy::Extensions::AppConfiguration)
