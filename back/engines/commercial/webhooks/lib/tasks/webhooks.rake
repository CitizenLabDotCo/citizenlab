# frozen_string_literal: true

namespace :webhooks do
  desc 'Clean up webhook deliveries older than 30 days'
  task cleanup_deliveries: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Enqueuing webhook delivery cleanup for tenant #{tenant.name} (ID: #{tenant.id})"
      Webhooks::CleanupDeliveriesJob.perform_later
    end
  end
end
