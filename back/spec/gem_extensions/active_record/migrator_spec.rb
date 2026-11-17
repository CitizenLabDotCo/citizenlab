# frozen_string_literal: true

require 'rails_helper'
require 'gem_extensions/active_record/migrator'
require 'gem_extensions/active_record/connection_adapters/postgre_sql_adapter'

# With PARALLEL_MIGRATION_THREADS > 1, the multi_tenancy Apartment initializer prepends these
# modules so that tenants migrated in parallel take different migration locks. They override and
# call Rails internals, so these specs guard them across Rails upgrades. The patches are not
# applied in the test environment, so the specs apply them to a single object.
RSpec.describe GemExtensions::ActiveRecord::Migrator do
  it 'overrides the method Rails uses to pick the migration lock' do
    expect(ActiveRecord::Migrator.private_method_defined?(:generate_migrator_advisory_lock_id)).to be(true)
    expect(described_class.instance_methods).to include(:generate_migrator_advisory_lock_id)
  end

  describe GemExtensions::ActiveRecord::ConnectionAdapters::PostgreSqlAdapter do
    let(:connection) do
      SimpleDelegator.new(ActiveRecord::Base.connection).extend(described_class)
    end

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
end
