# frozen_string_literal: true

namespace :churned_tenants do
  desc 'Remove "expired" user PII data from churned tenants'
  task remove_expired_pii: :environment do |_t, _args|
    MultiTenancy::ChurnedTenantService.new.remove_expired_pii
  end
end
