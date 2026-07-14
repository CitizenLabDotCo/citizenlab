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
  end
end
# rubocop:enable RSpec/DescribeClass
