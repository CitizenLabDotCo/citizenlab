# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:finish_stuck_tenant_deletions rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:finish_stuck_tenant_deletions'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(report_only_path)
    ENV.delete('REPORT_ONLY')
    ENV.delete('HOST')
    ENV.delete('POLL_TIMEOUT')
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

  def run_task(report_only: false, poll_timeout: nil)
    ENV['REPORT_ONLY'] = 'true' if report_only
    ENV['POLL_TIMEOUT'] = poll_timeout.to_s if poll_timeout
    ENV['HOST'] = stuck_tenant.host
    Rake::Task['single_use:finish_stuck_tenant_deletions'].invoke
  end

  def answer_prompt_with(answer)
    allow($stdin).to receive_messages(tty?: true, gets: "#{answer}\n")
  end

  def report
    JSON.parse(File.read(report_path))
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

    it 'leaves the tenant alone and reports when users cannot be deleted' do
      stuck_tenant.switch { create(:user) }
      allow(User).to receive(:destroy_all_async) # the sweep deletes nobody

      run_task(poll_timeout: 0)

      expect(Tenant.find_by(host: stuck_tenant.host)).to be_present
      expect(report['deletes']).to be_empty
      expect(report['errors'].first['error']).to match(/1 user\(s\) could not be deleted/)
    end
  end
end
# rubocop:enable RSpec/DescribeClass
