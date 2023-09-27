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

      expired_tenants = send(:expired_tenants, tenants)
      expired_tenants.each do |tenant|
        tenant.switch { User.destroy_all_async }
      end
    end

    def churn_datetime(tenant)
      # Unfortunately, we have to search lifecycle changes in both, the public
      # and tenant schema because tenant activities were logged in both places.
      datetime = [
        Apartment::Tenant.switch('public') { _churn_datetime(tenant) },
        tenant.switch { _churn_datetime(tenant) }
      ].compact.max

      datetime || raise(UnknownChurnDatetime)
    end

    private

    def _churn_datetime(tenant)
      Activity.where(item_id: tenant.id, action: 'changed_lifecycle_stage')
        .where("payload -> 'changes' ->> 1 = 'churned'")
        .order(created_at: :desc)
        .first&.acted_at
    end

    def expired_tenants(tenants = nil)
      tenants = (tenants || Tenant.not_deleted).churned

      tenants.select do |tenant|
        churn_datetime = send(:churn_datetime, tenant)
        pii_expired?(churn_datetime)
      end
    end

    def pii_expired?(churn_datetime)
      churn_date = churn_datetime.to_date
      today = Time.zone.today
      (today - churn_date) > pii_retention_period
    end

    class UnknownChurnDatetime < RuntimeError; end
  end
end
