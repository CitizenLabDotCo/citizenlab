# frozen_string_literal: true

####### Important information ####################
# This file is used to setup a shared extensions #
# within a dedicated schema. This gives us the   #
# advantage of only needing to enable extensions #
# in one place.                                  #
#                                                #
# This task should be run AFTER db:create but    #
# BEFORE db:migrate.                             #
##################################################

namespace :db do
  desc 'Also create shared_extensions Schema'
  task extensions: :environment do
    # We must use `:each_current_configuration` to mimic the behavior of `db:create`
    # which sometimes runs for more than one environment, potentially creating more than
    # one database. If we don't reproduce this behavior, the extensions will only be
    # installed correctly for database of the first environment (`Rails.env`). Currently,
    # there is only one situation where the `db:create` task is run for more than one
    # environment: when running it for the `development` environment, it will also run
    # for the `test` environment.
    ActiveRecord::Tasks::DatabaseTasks.send(:each_current_configuration, Rails.env) do |db_config|
      ActiveRecord::Base.establish_connection(db_config)

      # Create the schema that will hold the extensions
      ActiveRecord::Base.connection.execute 'CREATE SCHEMA IF NOT EXISTS shared_extensions;'

      # Install the extensions
      ActiveRecord::Base.connection.execute 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA shared_extensions;'
      ActiveRecord::Base.connection.execute 'CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA shared_extensions;'
      ActiveRecord::Base.connection.execute 'CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA shared_extensions;'
    end
  end

  desc 'Erase all tables'
  task clear: :environment do
    conn = ActiveRecord::Base.connection
    tables = conn.tables
    tables.each do |table|
      puts "Deleting #{table}"
      conn.drop_table(table)
    end
  end
end

Rake::Task['db:create'].enhance do
  Rake::Task['db:extensions'].invoke
end

Rake::Task['db:test:purge'].enhance do
  Rake::Task['db:extensions'].invoke
end
