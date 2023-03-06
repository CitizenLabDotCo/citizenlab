# frozen_string_literal: true

namespace :db do
  desc 'Run db:migrate only if there are pending migrations.'
  task migrate_if_pending: :environment do
    ActiveRecord::Migration.check_pending!(ActiveRecord::Base.connection)
  rescue ActiveRecord::PendingMigrationError
    Rake::Task['db:migrate'].invoke
  else
    puts 'Skipping db:migrate as there are no pending migrations.'
  end
end
