# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:migrate_proposals_phases_off_feed_view rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:migrate_proposals_phases_off_feed_view'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:report_path) { Rails.root.join('migrate_proposals_phases_off_feed_view.json') }
  let(:dry_run_report_path) { Rails.root.join('migrate_proposals_phases_off_feed_view_dry_run.json') }

  # The task writes only when passed 'execute', so most examples want it; `dry_run: true` drops it.
  def run_task(dry_run: false, host: nil)
    Rake::Task['single_use:migrate_proposals_phases_off_feed_view'].invoke(dry_run ? nil : 'execute', host)
  end

  # The feed view is being withdrawn for proposals, so the model will refuse to build this state
  # once the accompanying validation lands. Write it past validation, the way the admin UI did.
  def offer_feed!(phase, presentation_mode: 'feed', available_views: %w[card feed])
    phase.update_column(:presentation_mode, presentation_mode)
    phase.update_column(:available_views, available_views)
    phase
  end

  def report
    JSON.parse(File.read(report_path))
  end

  context 'when a proposals phase opens on the feed view' do
    let!(:phase) { offer_feed!(create(:proposals_phase)) }

    it 'moves it back to the card view' do
      run_task
      expect(phase.reload.presentation_mode).to eq 'card'
      expect(phase.reload.available_views).to eq ['card']
    end

    it 'records the change in the report' do
      run_task
      change = report['changes'].first
      expect(change['old_value']).to eq('presentation_mode' => 'feed', 'available_views' => %w[card feed])
      expect(change['new_value']).to eq('presentation_mode' => 'card', 'available_views' => ['card'])
      expect(change['context']).to include(
        'phase_id' => phase.id,
        'phase_title' => phase.title_multiloc,
        'phase_timing' => 'active',
        'project_id' => phase.project_id,
        'project_title' => phase.project.title_multiloc,
        'project_slug' => phase.project.slug
      )
    end

    it 'names the tenant in the summary' do
      expect { run_task }.to output(/Tenants with migrated phases:\s+#{Regexp.escape(Tenant.current.host)}/m).to_stdout
    end

    it 'prints the phase and its project under the tenant' do
      expect { run_task }.to output(
        /phase\s+#{phase.id}\s+.+ \(active\)\n\s+project\s+#{phase.project_id}\s/
      ).to_stdout
    end

    it 'reports a phase that has ended as finished' do
      phase.update!(start_at: Time.zone.today - 30.days, end_at: Time.zone.today - 7.days)
      run_task
      expect(report['changes'].first.dig('context', 'phase_timing')).to eq 'finished'
    end

    it 'reports a phase that has not started as future' do
      phase.update!(start_at: Time.zone.today + 7.days, end_at: Time.zone.today + 30.days)
      run_task
      expect(report['changes'].first.dig('context', 'phase_timing')).to eq 'future'
    end

    it 'processes a tenant that is marked as deleted' do
      Tenant.current.update_column(:deleted_at, Time.zone.now)
      run_task
      expect(phase.reload.presentation_mode).to eq 'card'
    end
  end

  # The admin chose that default and it remains available, so only the feed itself is withdrawn.
  context 'when a proposals phase offers the feed view but opens on another one' do
    let!(:phase) { offer_feed!(create(:proposals_phase), presentation_mode: 'map', available_views: %w[card map feed]) }

    it 'removes the feed view and leaves the presentation mode alone' do
      run_task
      expect(phase.reload.presentation_mode).to eq 'map'
      expect(phase.reload.available_views).to match_array %w[card map]
    end
  end

  # Subtracting the feed alone would write back a phase that still fails `must include card view`,
  # and report it as migrated.
  context 'when a phase using the feed view also omits the card view' do
    let!(:phase) { offer_feed!(create(:proposals_phase), available_views: ['feed']) }

    it 'restores the card view' do
      run_task
      expect(phase.reload.available_views).to eq ['card']
      expect(phase.reload).to be_valid
    end
  end

  context 'when a proposals phase does not use the feed view' do
    let!(:phase) { create(:proposals_phase, presentation_mode: 'map', available_views: %w[card map]) }

    it 'leaves it untouched and reports no change' do
      expect { run_task }.not_to(change { phase.reload.available_views })
      expect(report['changes']).to be_empty
      # Without this the example would also pass if the task had errored on every tenant.
      expect(report['errors']).to be_empty
      expect(report['processed_tenants']).to include(Tenant.current.host)
    end
  end

  # The feed view remains available to ideation, which is the method it was designed for.
  context 'when an ideation phase uses the feed view' do
    let!(:phase) { create(:idea_feed_phase) }

    it 'leaves it untouched' do
      expect { run_task }.not_to(change { phase.reload.presentation_mode })
      expect(report['changes']).to be_empty
    end
  end

  context 'when the task is run twice' do
    let!(:phase) { offer_feed!(create(:proposals_phase)) }

    it 'reports nothing to do on the second run' do
      run_task
      Rake::Task['single_use:migrate_proposals_phases_off_feed_view'].reenable

      expect { run_task }.not_to(change { phase.reload.available_views })
      expect(report['changes']).to be_empty
    end
  end

  # Apartment migrates `Tenant.not_deleted` only, so a tenant deleted before the
  # 20260223103753 migration has no `available_views` column and cannot offer the feed view.
  context 'when the schema predates the available_views column' do
    let!(:phase) { offer_feed!(create(:proposals_phase)) }

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

  context 'with a dry run' do
    let!(:phase) { offer_feed!(create(:proposals_phase)) }

    it 'writes nothing but still reports the change it would make' do
      expect { run_task(dry_run: true) }.not_to(change { phase.reload.available_views })

      expect(File).not_to exist(report_path)
      dry_run_report = JSON.parse(File.read(dry_run_report_path))
      expect(dry_run_report['changes'].first['new_value'])
        .to eq('presentation_mode' => 'card', 'available_views' => ['card'])
    end
  end
end
# rubocop:enable RSpec/DescribeClass
