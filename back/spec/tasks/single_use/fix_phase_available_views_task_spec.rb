# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:fix_phase_available_views rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:fix_phase_available_views'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
    ENV.delete('DRY_RUN')
    ENV.delete('HOST')
  end

  let(:report_path) { Rails.root.join('fix_phase_available_views.json') }
  let(:dry_run_report_path) { Rails.root.join('fix_phase_available_views_dry_run.json') }

  def run_task(dry_run: false, host: nil)
    ENV['DRY_RUN'] = 'true' if dry_run
    ENV['HOST'] = host if host
    Rake::Task['single_use:fix_phase_available_views'].invoke
  end

  # Mirrors the state left by the 20260223103753 backfill, which wrote with `update_column`.
  def drift!(phase, presentation_mode: 'map', available_views: ['card'])
    phase.update_column(:presentation_mode, presentation_mode)
    phase.update_column(:available_views, available_views)
    phase
  end

  def report
    JSON.parse(File.read(report_path))
  end

  context 'when a phase is drifted' do
    let!(:phase) { drift!(create(:budgeting_phase)) }

    it 'adds the presentation mode to available_views' do
      run_task
      expect(phase.reload.available_views).to match_array %w[card map]
      expect(phase.reload).to be_valid
    end

    it 'records the change in the report' do
      run_task
      change = report['changes'].first
      expect(change['old_value']).to eq ['card']
      expect(change['new_value']).to match_array %w[card map]
      expect(change['context']).to include('phase_id' => phase.id, 'presentation_mode' => 'map')
    end

    it 'processes a tenant that is marked as deleted' do
      Tenant.current.update_column(:deleted_at, Time.zone.now)
      run_task
      expect(phase.reload.available_views).to match_array %w[card map]
    end
  end

  context 'when a phase is not drifted' do
    let!(:phase) { create(:budgeting_phase) }

    it 'leaves it untouched and reports no change' do
      expect { run_task }.not_to(change { phase.reload.available_views })
      expect(report['changes']).to be_empty
      # Without this the example would also pass if the task had errored on every tenant.
      expect(report['errors']).to be_empty
      expect(report['processed_tenants']).to include(Tenant.current.host)
    end
  end

  context 'when the presentation mode is not a known mode' do
    let!(:phase) { drift!(create(:budgeting_phase), presentation_mode: 'nonsense') }

    it 'skips the phase and reports an error' do
      expect { run_task }.not_to(change { phase.reload.available_views })
      expect(report['changes']).to be_empty
      expect(report['errors'].first['error']).to match(/"nonsense" is not a known presentation mode/)
    end
  end

  # Apartment migrates `Tenant.not_deleted` only, so a tenant deleted before the
  # 20260223103753 migration has no `available_views` column and cannot be drifted.
  context 'when the schema predates the available_views migration' do
    let!(:phase) { create(:budgeting_phase) }

    before do
      allow(ActiveRecord::Base.connection).to receive(:column_exists?)
        .with(:phases, :available_views).and_return(false)
    end

    it 'skips the tenant without reporting an error' do
      expect { run_task }.not_to raise_error
      expect(report['errors']).to be_empty
      expect(report['changes']).to be_empty
    end
  end

  context 'with DRY_RUN=true' do
    let!(:phase) { drift!(create(:budgeting_phase)) }

    it 'writes nothing but still reports the change it would make' do
      expect { run_task(dry_run: true) }.not_to(change { phase.reload.available_views })

      expect(File).not_to exist(report_path)
      dry_run_report = JSON.parse(File.read(dry_run_report_path))
      expect(dry_run_report['changes'].first['new_value']).to match_array %w[card map]
    end
  end
end
# rubocop:enable RSpec/DescribeClass
