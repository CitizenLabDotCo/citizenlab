# frozen_string_literal: true

namespace :analytics do
  desc 'Populates the dimension tables for each tenant'
  task populate_dimensions: :environment do
    Rails.logger.info 'analytics:populate_dimensions started'
    Tenant.not_deleted.each do |tenant|
      tenant.switch { Analytics::PopulateDimensionsService.run }
    end
    Rails.logger.info 'analytics:populate_dimensions finished'
  end
end

Rake::Task['db:migrate'].enhance do
  Rake::Task['analytics:populate_dimensions'].execute
end
