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
    let(:hook) do
      Rake::Task['db:schema:dump'].actions.find do |action|
        action.source_location&.first == Rails.root.join('lib/tasks/db.rake').to_s
      end
    end
    let(:postprocess_task) { Rake::Task['db:postprocess_structure_sql'] }

    before { allow(postprocess_task).to receive(:execute) }
    after { postprocess_task.reenable }

    it 'post-processes structure.sql after dumping it' do
      expect(hook).to be_present
    end

    # ros-apartment dumps the schema again after migrating the tenants.
    it 'post-processes every dump in the same run' do
      2.times { hook.call }

      expect(postprocess_task).to have_received(:execute).twice
    end
  end
end
# rubocop:enable RSpec/DescribeClass
