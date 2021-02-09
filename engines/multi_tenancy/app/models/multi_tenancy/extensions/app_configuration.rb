# frozen_string_literal: true

module MultiTenancy
  module Extensions
    module AppConfiguration
      def self.included(base)
        base.extend ClassMethods
      end

      module ClassMethods
        # @return [Array<::AppConfiguration>]
        def of_all_tenants
          sql_query = Apartment.tenant_names
                               .map { |schema| "SELECT * FROM \"#{schema}\".\"app_configurations\" " }
                               .join(' UNION ')

          app_configuration = ActiveRecord::Base.connection.execute(sql_query)
          app_configuration.map { |record| new(record) }
        end
      end
    end
  end
end

AppConfiguration.include(MultiTenancy::Extensions::AppConfiguration)
