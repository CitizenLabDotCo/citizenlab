# frozen_string_literal: true

# desc "Explaining what the task does"
# task :analytics do
#   # Task goes here
# end
#
namespace :analytics do
  # Refresh materialized views
  namespace :refresh do
    desc 'Refresh the materialized views for facts'
    task facts: :environment do
      puts 'Refreshing fact views'
      # TODO: There is an issue with cascading views - always refreshing empty_localhost
      Apartment::TaskHelper.each_tenant do |tenant|
        ActiveRecord::Base.connects_to database: { writing: :analytics, reading: :analytics }
        ActiveRecord::Base.connection.schema_search_path = tenant
        puts("Refreshing Fact views for #{tenant}")
        Analytics::FactPost.refresh
        Analytics::FactParticipation.refresh
      end
    end

    desc 'Refresh the materialized views for dimensions'
    task dimensions: :environment do
      puts 'Refreshing dimension views'
    end
  end

  desc 'Copies the view .sql files to the main codebase as scenic will only run them from there'
  task copy_views: :environment do
    puts 'Copying analytics views out of engine'
    cp_r 'engines/commercial/analytics/db/views/.', 'db/views'
  end

  namespace :multi_tenancy do
    desc 'Enables multi-tenant migrations on the analytics database'
    task migrate: :environment do
      Apartment::TaskHelper.each_tenant do |tenant|
        ActiveRecord::Base.connects_to database: { writing: :analytics, reading: :analytics }
        puts("Migrating #{tenant} tenant in Analytics DB")
        Apartment::TaskHelper.migrate_tenant(tenant)
      end
    end

    desc 'Enables multi-tenant rollback on the analytics database'
    task rollback: :environment do
      step = ENV['STEP'] ? ENV['STEP'].to_i : 1

      Apartment::TaskHelper.each_tenant do |tenant|
        ActiveRecord::Base.connects_to database: { writing: :analytics, reading: :analytics }
        puts("Rolling back #{tenant} tenant in Analytics DB")
        Apartment::Migrator.rollback tenant, step
      rescue Apartment::TenantNotFound => e
        puts e.message
      end
    end
  end
end

# Migrate: Copy migrations BEFORE and then run multi-tenant migrations AFTER default migrations
Rake::Task['db:migrate:analytics'].enhance(['analytics:copy_views']) do
  Rake::Task['analytics:multi_tenancy:migrate'].execute
end

Rake::Task['db:migrate'].enhance(['analytics:copy_views']) do
  Rake::Task['analytics:multi_tenancy:migrate'].execute
end

# Migrate: Rollback multi-tenant migrations BEFORE default migrations (reverse of above)
Rake::Task['db:rollback:analytics'].enhance(['analytics:multi_tenancy:rollback'])


# db:migrate:primary also does not pickup multi-tenancy but also cannot run apartment:migrate directly
# So we have to copy all the code again. Needs refactoring into shared functions.
namespace :primary do
  namespace :multi_tenancy do
    desc 'Enables multi-tenant migrations on the primary database'
    task migrate: :environment do
      Apartment::TaskHelper.each_tenant do |tenant|
        Apartment::TaskHelper.migrate_tenant(tenant)
      end
    end

    desc 'Enables multi-tenant rollback on the primary database'
    task rollback: :environment do
      step = ENV['STEP'] ? ENV['STEP'].to_i : 1
      Apartment::TaskHelper.each_tenant do |tenant|
        puts("Rolling back #{tenant} tenant in Primary DB")
        Apartment::Migrator.rollback tenant, step
      rescue Apartment::TenantNotFound => e
        puts e.message
      end
    end
  end
end

Rake::Task['db:rollback:primary'].enhance(['primary:multi_tenancy:rollback'])

Rake::Task['db:migrate:primary'].enhance do
  Rake::Task['primary:multi_tenancy:rollback'].execute
end
