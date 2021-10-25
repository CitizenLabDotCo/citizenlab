# frozen_string_literal: true

class ChurnedTenantService
  # This service provides a few helper functions to deal with the cleaning of
  # churned tenants.

  attr_reader :pii_retention_period

  # @param [Integer,NilClass] pii_retention_period How long before user PII
  #   data are removed from churned tenants (in days since churn).
  def initialize(pii_retention_period: nil)
    @pii_retention_period = pii_retention_period || ENV['CHURNED_TENANT_PII_RETENTION_PERIOD']&.to_i
  end

  def remove_expired_pii(tenants = nil)
    return unless @pii_retention_period

    tenants = (tenants || Tenant.all).churned
    today = Date.today

    tenants.each do |tenant|
      last_update_date = tenant.updated_at.to_date
      tenant.switch { User.destroy_all_async } if (today - last_update_date) > pii_retention_period
    end
  end
end
