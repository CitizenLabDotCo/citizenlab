# frozen_string_literal: true

# This service provides a few helper functions to deal with the cleaning of
# churned tenants.
module MultiTenancy
  class ChurnedTenantService
    attr_reader :pii_retention_period

    # @param [Integer,NilClass] pii_retention_period How long before user PII
    #   data are removed from churned tenants (in days since churn).
    def initialize(pii_retention_period: nil)
      @pii_retention_period = pii_retention_period || ENV['CHURNED_TENANT_PII_RETENTION_PERIOD']&.to_i
    end

    # @param [Tenant::ActiveRecord_Relation,NilClass] tenants
    def remove_expired_pii(tenants = nil)
      return unless @pii_retention_period

      tenants = (tenants || Tenant.all).churned
      tenants.each do |tenant|
        churn_date = tenant.updated_at.to_date
        tenant.switch { User.destroy_all_async } if pii_expired?(churn_date)
      end
    end

    private

    def pii_expired?(churn_date)
      today = Date.today
      (today - churn_date) > pii_retention_period
    end
  end
end
