# frozen_string_literal: true

require 'rails_helper'
require 'apartment/tasks/task_helper'
require 'gem_extensions/active_record/migrator'
require 'gem_extensions/active_record/connection_adapters/postgre_sql_adapter'

# With PARALLEL_MIGRATION_THREADS > 1, the multi_tenancy Apartment initializer prepends these
# modules so that tenants migrated in parallel take different migration locks. They override and
# call Rails internals, so these specs guard them across Rails upgrades. The patches are not
# applied in the test environment, so the specs apply them to a single object.
RSpec.describe GemExtensions::ActiveRecord::Migrator do
  let(:connection) do
    SimpleDelegator
      .new(ActiveRecord::Base.connection)
      .extend(GemExtensions::ActiveRecord::ConnectionAdapters::PostgreSqlAdapter)
  end

  it 'overrides the method Rails uses to pick the migration lock' do
    expect(ActiveRecord::Migrator.private_method_defined?(:generate_migrator_advisory_lock_id)).to be(true)
    expect(described_class.instance_methods).to include(:generate_migrator_advisory_lock_id)
  end

  it 'makes Rails take the migration lock with the lock id of the current schema' do
    migrator = ActiveRecord::Migrator.allocate.extend(described_class)
    allow(ActiveRecord::Base).to receive(:connection).and_return(connection)
    allow(migrator).to receive_messages(connection: connection, load_migrated: nil)
    allow(connection).to receive_messages(get_advisory_lock: true, release_advisory_lock: true)

    migrator.send(:with_advisory_lock) { nil }

    expect(connection).to have_received(:get_advisory_lock).with(connection.generate_advisory_lock_id)
  end

  describe GemExtensions::ActiveRecord::ConnectionAdapters::PostgreSqlAdapter do
    it 'gives each tenant schema its own lock id' do
      tenant_lock_id = connection.generate_advisory_lock_id
      public_lock_id = Apartment::Tenant.switch('public') { connection.generate_advisory_lock_id }

      expect(tenant_lock_id).not_to eq(public_lock_id)
    end

    it 'gives the same schema the same lock id every time, so two migrations of one schema still exclude each other' do
      first_lock_id = connection.generate_advisory_lock_id

      expect(connection.generate_advisory_lock_id).to eq(first_lock_id)
    end

    it 'returns a lock id that fits in a PostgreSQL bigint' do
      expect(connection.generate_advisory_lock_id).to be_between(1, (2**63) - 1)
    end
  end

  # Apartment's own defaults for parallel runs would leave the locks above unused.
  describe 'Apartment parallel migration settings' do
    it 'keeps the migration locks on when Apartment reconnects for a parallel run' do
      allow(ActiveRecord::Base).to receive(:establish_connection)

      Apartment::TaskHelper.send(:reconnect_for_parallel_execution)

      expect(ActiveRecord::Base).to have_received(:establish_connection).with(hash_excluding(advisory_locks: false))
    end

    it 'runs the parallel workers as threads' do
      expect(Apartment::TaskHelper.send(:resolve_parallel_strategy)).to eq(:threads)
    end
  end
end
