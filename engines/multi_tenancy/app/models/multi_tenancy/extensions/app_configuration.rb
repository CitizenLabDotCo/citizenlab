# frozen_string_literal: true

module MultiTenancy
  module Extensions
    module AppConfiguration
      def self.included(base)
        base.class_eval do
          def self.of_all_tenants
            from_tenants(Tenant.all)
          end

          # @return [Array<::AppConfiguration>]
          def self.from_tenants(tenants)
            colnames = column_names.join(', ')
            sql_query = tenants.map(&:schema_name)
                              .map { |schema| "SELECT #{colnames} FROM \"#{schema}\".app_configurations" }
                              .join(' UNION ')

            app_configuration = ActiveRecord::Base.connection.execute(sql_query)
            app_configuration.map { |record| new(record) }
          end
        end
      end

      # Returns the corresponding tenant.
      #
      # @return [Tenant]
      def tenant
        Tenant.find_by(id: id)
      end
    end
  end
end

AppConfiguration.include(MultiTenancy::Extensions::AppConfiguration)
