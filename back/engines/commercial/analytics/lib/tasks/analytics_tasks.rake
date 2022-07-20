# frozen_string_literal: true

# Base rake tasks - multi-tenant enhancements can be found in multi-tenancy engine

namespace :analytics do

  desc 'Copies the view .sql files to the main codebase as scenic will only reference them from there'
  task copy_views: :environment do
    Rails.logger.info('Copying analytics views out of engine')
    cp_r 'engines/commercial/analytics/db/views/.', 'db/views'
  end

  # Refresh materialized views
  namespace :refresh do
    desc 'Refresh the materialized views for facts'
    task facts: :environment do
      puts 'Refreshing fact views'
      # TODO: There is an issue with cascading views - always refreshing empty_localhost
      # TODO: Multi-tenancy needs moving to citizenlab-ee
      Apartment::TaskHelper.each_tenant do |tenant|
        ActiveRecord::Base.connects_to database: { writing: :analytics, reading: :analytics }
        ActiveRecord::Base.connection.schema_search_path = tenant
        Rails.logger.info("Refreshing Fact views for #{tenant}")
        Analytics::FactPost.refresh
        Analytics::FactParticipation.refresh
      end
    end

    desc 'Refresh the materialized views for dimensions'
    task dimensions: :environment do
      Rails.logger.info('Refreshing dimension views')
    end
  end

end

# Enhance :migrate - Copy migrations to main codebase BEFORE migrating
Rake::Task['db:migrate:analytics'].enhance(['analytics:copy_views'])
Rake::Task['db:migrate'].enhance(['analytics:copy_views'])
