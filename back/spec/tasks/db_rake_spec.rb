# frozen_string_literal: true

require 'rails_helper'

# These tasks hook into Rails' own db tasks and use the migration context, so these specs guard
# them across Rails upgrades.
# rubocop:disable RSpec/DescribeClass
describe 'db rake tasks' do
  before { load_rake_tasks_if_not_loaded }

  describe 'db:migrate_if_pending' do
    let(:task) { Rake::Task['db:migrate_if_pending'] }
    let(:migrate_task) { Rake::Task['db:migrate'] }

    before { allow(migrate_task).to receive(:invoke) }
    after { task.reenable }

    it 'does not migrate when every schema is up to date' do
      task.invoke

      expect(migrate_task).not_to have_received(:invoke)
    end

    it "migrates when a tenant's schema is behind" do
      ActiveRecord::Base.connection.execute(<<~SQL.squish)
        DELETE FROM example_org.schema_migrations
        WHERE version = (SELECT MAX(version) FROM example_org.schema_migrations)
      SQL

      task.invoke

      expect(migrate_task).to have_received(:invoke)
    end
  end

  describe 'db:schema:dump' do
    it 'post-processes structure.sql after dumping it' do
      action_files = Rake::Task['db:schema:dump'].actions.filter_map { |action| action.source_location&.first }

      expect(action_files).to include(Rails.root.join('lib/tasks/db.rake').to_s)
    end
  end
end
# rubocop:enable RSpec/DescribeClass
