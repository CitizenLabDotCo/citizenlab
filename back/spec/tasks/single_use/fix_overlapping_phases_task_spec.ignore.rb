# frozen_string_literal: true

require 'rails_helper'

describe 'rake fix_existing_tenants:fix_overlapping_phases' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['fix_existing_tenants:fix_overlapping_phases'] }

  it 'fixes overlapping phases on demo tenants by decreasing the first phase end_at' do
    demo_tenant = create(
      :tenant,
      settings: SettingsService.new.minimal_required_settings(
        locales: %w[en],
        lifecycle_stage: 'demo',
        country_code: 'BE'
      ),
      creation_finalized_at: Time.zone.now
    )

    demo_tenant.switch do
      project = create(:project)
      # Create valid phases first
      phase1 = create(:phase, project: project, start_at: 10.days.ago.to_date, end_at: Time.zone.yesterday)
      phase2 = create(:phase, project: project, start_at: Time.zone.today, end_at: 10.days.from_now.to_date)

      # Simulate the buggy state by creating overlap with update_column (bypasses validation)
      phase1.update_column(:end_at, Time.zone.today)

      expect(phase1.end_at).to eq(phase2.start_at)

      task.execute

      phase1.reload
      phase2.reload

      expect(phase1.end_at).to eq(Time.zone.yesterday)
      expect(phase2.start_at).to eq(Time.zone.today)
      expect(phase1.end_at).to be < phase2.start_at
    end
  end

  it 'does not modify phases on active tenants' do
    # The default test tenant is active
    project = create(:project)
    phase1 = create(:phase, project: project, start_at: 10.days.ago.to_date, end_at: Time.zone.yesterday)
    phase2 = create(:phase, project: project, start_at: Time.zone.today, end_at: 10.days.from_now.to_date)

    # Simulate the buggy state
    phase1.update_column(:end_at, Time.zone.today)

    task.execute

    phase1.reload
    phase2.reload

    # Phases should remain unchanged (active tenant not processed)
    expect(phase1.end_at).to eq(Time.zone.today)
    expect(phase2.start_at).to eq(Time.zone.today)
  end

  it 'does not modify phases that do not overlap' do
    demo_tenant = create(
      :tenant,
      settings: SettingsService.new.minimal_required_settings(
        locales: %w[en],
        lifecycle_stage: 'demo',
        country_code: 'BE'
      ),
      creation_finalized_at: Time.zone.now
    )

    demo_tenant.switch do
      project = create(:project)
      phase1 = create(:phase, project: project, start_at: 10.days.ago.to_date, end_at: Time.zone.yesterday)
      phase2 = create(:phase, project: project, start_at: Time.zone.today, end_at: 10.days.from_now.to_date)

      task.execute

      phase1.reload
      phase2.reload

      # Phases should remain unchanged
      expect(phase1.end_at).to eq(Time.zone.yesterday)
      expect(phase2.start_at).to eq(Time.zone.today)
    end
  end
end
