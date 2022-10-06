# frozen_string_literal: true

namespace :analytics do
  desc 'Copies the view .sql files to the main codebase as scenic will need to run them from there'
  task copy_views: :environment do
    cp_r 'engines/commercial/analytics/db/views/.', 'db/views'
  end

  desc 'Populates the dimension tables for each tenant'
  task populate_dimensions: :environment do
    Tenant.not_deleted.each do |tenant|
      tenant.switch { Analytics::PopulateDimensionsService.run }
    end
  end
end

Rake::Task['analytics:install:migrations'].enhance(['analytics:copy_views'])

Rake::Task['db:migrate'].enhance do
  Rake::Task['analytics:populate_dimensions'].execute
end
