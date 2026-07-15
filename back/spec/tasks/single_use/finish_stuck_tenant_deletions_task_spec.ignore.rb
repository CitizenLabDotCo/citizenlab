# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:finish_stuck_tenant_deletions rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:finish_stuck_tenant_deletions'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(report_only_path)
  end

  let(:report_path) { Rails.root.join('finish_stuck_tenant_deletions.json') }
  let(:report_only_path) { Rails.root.join('finish_stuck_tenant_deletions_report.json') }

  # A tenant whose deletion stalled: `deleted_at` is set but the row still exists, because a
  # completed deletion destroys it.
  let!(:stuck_tenant) do
    create(:tenant, host: 'stuck.example.com').tap do |tenant|
      tenant.update_column(:deleted_at, 3.months.ago)
      tenant.reload # Postgres stores microseconds; the in-memory Time keeps nanoseconds.
    end
  end

  # The task prompts and destroys only when passed 'execute'; `report_only: true` drops it.
  def run_task(report_only: false, poll_timeout: nil)
    Rake::Task['single_use:finish_stuck_tenant_deletions']
      .invoke(report_only ? nil : 'execute', stuck_tenant.host, poll_timeout&.to_s)
  end

  def answer_prompt_with(answer)
    allow($stdin).to receive_messages(tty?: true, gets: "#{answer}\n")
  end

  # A pending DeleteUserJob for the given schema. Built by hand rather than through factory
  # transients, which do not exist on this branch.
  def enqueue_delete_user_job(schema_name)
    create(:que_job, args: [{
      job_id: SecureRandom.uuid,
      job_class: 'DeleteUserJob',
      arguments: [],
      tenant_schema_name: schema_name,
      enqueued_at: Time.zone.now.iso8601,
      queue_name: 'default',
      executions: 0,
      priority: nil,
      locale: 'en',
      timezone: 'UTC',
      provider_job_id: nil,
      exception_executions: {}
    }])
  end

  # The same job already failing: a positive `error_count` with a captured message is exactly the
  # state of a DeleteUserJob wedged on a missing column, mid-retry and not yet expired.
  def enqueue_errored_delete_user_job(schema_name, error:)
    enqueue_delete_user_job(schema_name).tap do |job|
      job.update_columns(error_count: 5, last_error_message: error)
    end
  end

  def report
    JSON.parse(File.read(report_path))
  end

  context 'when there is nothing to do' do
    before { stuck_tenant.update_column(:deleted_at, nil) }

    it 'says so' do
      allow($stdin).to receive(:tty?).and_return(true)
      expect($stdin).not_to receive(:gets)

      expect { run_task }.to output(/No unfinished tenant deletions on this cluster/).to_stdout
    end
  end

  # A deletion with jobs in flight is in progress, not stuck. Running `User.destroy_all_async` again
  # — the sweep — would enqueue a second DeleteUserJob per user, which is what produced the 439k
  # RecordNotFound events.
  context 'when the deletion is still in progress' do
    before do
      allow($stdin).to receive(:tty?).and_return(true)
      enqueue_delete_user_job(stuck_tenant.schema_name)
    end

    it 'skips the tenant without prompting' do
      expect($stdin).not_to receive(:gets)
      expect(User).not_to receive(:destroy_all_async)

      run_task

      expect(Tenant.find_by(host: stuck_tenant.host)).to be_present
    end
  end

  context 'without a TTY' do
    before { allow($stdin).to receive(:tty?).and_return(false) }

    it 'aborts rather than treating every tenant as skipped' do
      expect { run_task }.to raise_error(SystemExit)
      expect(Tenant.find_by(host: stuck_tenant.host)).to be_present
    end
  end

  context 'with REPORT_ONLY=true' do
    before { allow($stdin).to receive(:tty?).and_return(false) }

    it 'reports without a TTY, asks nothing and destroys nothing' do
      expect($stdin).not_to receive(:gets)

      expect { run_task(report_only: true) }.not_to raise_error

      expect(Tenant.find_by(host: stuck_tenant.host)).to be_present
      expect(JSON.parse(File.read(report_only_path))['processed_tenants']).to include(stuck_tenant.host)
    end
  end

  context 'when the operator does not type the host' do
    it 'skips the tenant, leaving deleted_at untouched' do
      answer_prompt_with('yes')

      run_task

      tenant = Tenant.find_by(host: stuck_tenant.host)
      expect(tenant).to be_present
      expect(tenant.deleted_at).to eq stuck_tenant.deleted_at
      expect(report['deletes']).to be_empty
      expect(report['errors']).to be_empty
    end
  end

  context 'when the operator quits' do
    it 'destroys nothing' do
      answer_prompt_with('q')

      run_task

      expect(Tenant.find_by(host: stuck_tenant.host)).to be_present
    end
  end

  context 'when the operator types the host' do
    before { answer_prompt_with(stuck_tenant.host) }

    it 'sweeps the users and destroys the tenant' do
      stuck_tenant.switch { create(:user) }
      allow(User).to receive(:destroy_all_async) { User.delete_all }

      run_task

      expect(User).to have_received(:destroy_all_async)
      expect(Tenant.find_by(host: stuck_tenant.host)).to be_nil
      expect(report['deletes'].first['context']).to include('host' => stuck_tenant.host)
    end

    # test-oic-münster was deleted before the 20260223103753 migration, so its schema has no
    # `available_views` column. A failing diagnostic must not make the tenant unprocessable.
    it 'still destroys a tenant whose schema predates the available_views migration' do
      allow(ActiveRecord::Base.connection).to receive(:column_exists?)
        .with(:phases, :available_views).and_return(false)

      run_task

      expect(Tenant.find_by(host: stuck_tenant.host)).to be_nil
      expect(report['errors']).to be_empty
    end

    it 'leaves the tenant alone and reports when users cannot be deleted' do
      stuck_tenant.switch { create(:user) }
      allow(User).to receive(:destroy_all_async) # stub the sweep: it deletes nobody, and queues nothing

      run_task(poll_timeout: 0)

      expect(Tenant.find_by(host: stuck_tenant.host)).to be_present
      expect(report['deletes']).to be_empty
      expect(report['errors'].first['error']).to match(/1 user\(s\) could not be deleted/)
    end

    # A large tenant's `User.destroy_all_async` sweep only deletes five users per second, so it can
    # outlast the poll. That is not a failure, and must not be reported as one -- nor should it
    # surface a stale error from a previous attempt.
    it 'reports a sweep that is still running as in progress, not as a failure' do
      stuck_tenant.switch { create(:user) }
      allow(User).to receive(:destroy_all_async) do
        enqueue_delete_user_job(stuck_tenant.schema_name)
      end

      run_task(poll_timeout: 0)

      expect(Tenant.find_by(host: stuck_tenant.host)).to be_present
      expect(report['errors'].first['error']).to match(/sweep still in progress/)
    end

    # A job that keeps raising sits in not_finished/not_expired for days (its retry backoff grows
    # steeply), so it must be recognised by its error, not miscounted as a sweep still in progress.
    # This is the residual-gap signal: a column a skipped migration would have added surfaces here.
    it 'reports the DeleteUserJob error when the sweep leaves a failing job' do
      stuck_tenant.switch { create(:user) }
      allow(User).to receive(:destroy_all_async) do
        enqueue_errored_delete_user_job(stuck_tenant.schema_name, error: 'PG::UndefinedColumn: column "foo" does not exist')
      end

      run_task(poll_timeout: 0)

      expect(Tenant.find_by(host: stuck_tenant.host)).to be_present
      error = report['errors'].first['error']
      expect(error).to match(/DeleteUserJob error:.*column "foo" does not exist/)
      expect(error).not_to match(/still in progress/)
    end
  end

  # A tenant deleted months ago was frozen before later migrations ran, so its schema lacks columns
  # the delete cascade needs. The task brings it forward before sweeping — running only within-schema
  # additive structural migrations, never data/index/role ones. The migration set is stubbed so the
  # example does not depend on the tenant's real schema_migrations (which the factory fills in full).
  context 'when the schema is missing migrations' do
    let(:migration_context) { ActiveRecord::Base.connection_pool.migration_context }
    let(:structural_version) { 99_999_999_999_001 }
    let(:skipped_version) { 99_999_999_999_002 }
    let(:grant_version) { 99_999_999_999_003 }

    before do
      structural = instance_double(
        ActiveRecord::MigrationProxy,
        version: structural_version, name: 'AddFooToThings', filename: '/fake/structural.rb'
      )
      skipped = instance_double(
        ActiveRecord::MigrationProxy,
        version: skipped_version, name: 'AddUniqueIndexToThings', filename: '/fake/skipped.rb'
      )
      # Additive AND grants: only the body scan catches it. It must still be skipped — grants are
      # cluster-global and must never run to finish one tenant's deletion.
      grant = instance_double(
        ActiveRecord::MigrationProxy,
        version: grant_version, name: 'AddBarToThingsAndGrant', filename: '/fake/grant.rb'
      )
      allow(ActiveRecord::Base.connection_pool).to receive(:migration_context).and_return(migration_context)
      allow(migration_context).to receive(:migrations).and_return([structural, skipped, grant])
      allow(migration_context).to receive(:run)
      allow(File).to receive(:read).and_call_original
      allow(File).to receive(:read).with('/fake/structural.rb').and_return('add_column :things, :foo, :string')
      allow(File).to receive(:read).with('/fake/skipped.rb').and_return('add_index :things, :foo, unique: true')
      allow(File).to receive(:read).with('/fake/grant.rb')
        .and_return("add_column :things, :bar, :string\n    execute 'GRANT SELECT ON things TO analytics_reader'")

      answer_prompt_with(stuck_tenant.host)
      allow(User).to receive(:destroy_all_async) { stuck_tenant.switch { User.delete_all } }
    end

    it 'runs only the additive structural migration — not the index or the granting one' do
      run_task

      expect(migration_context).to have_received(:run).with(:up, structural_version)
      expect(migration_context).not_to have_received(:run).with(:up, skipped_version)
      expect(migration_context).not_to have_received(:run).with(:up, grant_version)
      expect(Tenant.find_by(host: stuck_tenant.host)).to be_nil
    end

    it 'shows the counts and lists the migrations it will run, before prompting' do
      expect { run_task }.to output(
        a_string_matching(/missing migrations: 3 \(1 structural to run, 2 skipped/)
          .and(a_string_matching(/structural migrations to run:\n\s+structural/))
      ).to_stdout
    end

    it 'lists them in report (dry-run) mode too, without applying anything' do
      expect { run_task(report_only: true) }.to output(/structural migrations to run:\n\s+structural/).to_stdout
      expect(migration_context).not_to have_received(:run)
    end

    it 'rescues a failing migration, reports it, and still finishes the deletion' do
      allow(migration_context).to receive(:run)
        .with(:up, structural_version).and_raise(ActiveRecord::StatementInvalid, 'PG::Boom')

      run_task

      expect(report['errors'].map { |e| e['error'] })
        .to include(a_string_matching(/migration #{structural_version} \(AddFooToThings\).*PG::Boom/))
      expect(Tenant.find_by(host: stuck_tenant.host)).to be_nil
    end
  end

  # The safety property the whole design rests on: a migration run to finish one deletion must not
  # reach any other tenant. Unlike the examples above this runs a *real* migration — nothing about
  # `run` is stubbed — which also confirms `connection_pool.migration_context.run` behaves on this
  # Rails/PostGIS build. A bystander tenant is left in the identical "missing" state and must be
  # untouched, proving the DDL is confined to the switched-in schema.
  context 'when a real migration is applied' do
    let!(:bystander) { create(:tenant, host: 'bystander.example.com') }
    let(:version) { 20_260_622_120_000 } # add_placement_type_to_phases — additive, within-schema

    def placement_type_column?(tenant)
      tenant.switch { ActiveRecord::Base.connection.column_exists?(:phases, :placement_type) }
    end

    before do
      answer_prompt_with(stuck_tenant.host)
      stuck_tenant.switch { create(:user) } # keep the tenant alive past the sweep, so we can inspect it
      allow(User).to receive(:destroy_all_async) # no-op sweep: the user remains and the tenant is not destroyed

      # Freeze both schemas just before this migration: drop its column and forget its version, so
      # the task sees it as missing on each.
      [stuck_tenant, bystander].each do |tenant|
        tenant.switch do
          conn = ActiveRecord::Base.connection
          conn.remove_column(:phases, :placement_type) if conn.column_exists?(:phases, :placement_type)
          conn.execute("DELETE FROM schema_migrations WHERE version = '#{version}'")
        end
      end
    end

    it 'applies the missing migration to the targeted schema only, leaving other tenants untouched' do
      expect(placement_type_column?(stuck_tenant)).to be(false) # precondition: both start without it
      expect(placement_type_column?(bystander)).to be(false)

      run_task(poll_timeout: 0) # scoped to stuck_tenant.host

      expect(placement_type_column?(stuck_tenant)).to be(true)  # ran here
      expect(placement_type_column?(bystander)).to be(false)    # and reached no other schema
    end
  end
end
# rubocop:enable RSpec/DescribeClass
