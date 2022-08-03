# frozen_string_literal: true

namespace :analytics do
  desc 'Copies the view .sql files to the main codebase as scenic will need to run them from there'
  task copy_views: :environment do
    puts 'Copying analytics views out of engine'
    cp_r 'engines/commercial/analytics/db/views/.', 'db/views'
  end
end

Rake::Task['analytics:install:migrations'].enhance(['analytics:copy_views'])