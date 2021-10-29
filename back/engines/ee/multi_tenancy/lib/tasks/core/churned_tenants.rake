# frozen_string_literal: true

namespace :tenants do
  desc 'Remove "expired" user PII data from churned tenants'
  task remove_pii_from_churned: :environment do |_t, _args|
    MultiTenancy::ChurnedTenantService.new.remove_expired_pii
  end
end
