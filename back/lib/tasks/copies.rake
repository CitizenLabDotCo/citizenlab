# frozen_string_literal: true

namespace :copies do
  # If a custom field (a platform) is created without a copy for the specific language,
  # and then we add this language to CitizenLab (or to the platform),
  # the copy isn't added to the already existing custom field.
  # So, the Spanish copy can be in English though it was translated recently.

  # This task doesn't solve the problem fundamentally, but it updates the copies,
  # which can be a fine trade-off between spent time and the result.
  desc 'Update custom fields to the latest copy versions'
  task :update_custom_fields, [:host] => :environment do |_t, args|
    tenants = args[:host].present? ? Tenant.where(host: args[:host]) : Tenant.all
    tenants.each do |tenant|
      tenant.switch do
        Rails.logger.info("Processing #{tenant.host}")
        CopiesUpdatingService.new.update_custom_fields
      end
    end
  end
end
