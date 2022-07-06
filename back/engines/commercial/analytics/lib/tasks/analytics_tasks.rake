# frozen_string_literal: true

# desc "Explaining what the task does"
# task :analytics do
#   # Task goes here
# end
#
namespace :analytics do
  # Refresh materialized views
  namespace :refresh do
    desc 'Refresh the materialized views for dimensions'
    task dimensions: :environment do
      puts 'Refreshing dimension views'
    end

    desc 'Refresh the materialized views for facts'
    task facts: :environment do
      puts 'Refreshing fact views'
      # TODO: Currently saying 'analytics_fact_activities' does not exist - but it does
      # Analytics::FactActivity.refresh
    end
  end

  desc 'Copies the view .sql files to the main codebase as scenic will only run them from there'
  task copy_views: :environment do
    puts 'Copying analytics views out of engine'
    cp_r 'engines/commercial/analytics/db/views/.', 'db/views'
  end
end

Rake::Task['db:migrate:analytics'].enhance(['analytics:copy_views'])
Rake::Task['db:migrate'].enhance(['analytics:copy_views'])
