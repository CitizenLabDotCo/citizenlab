# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
# rubocop:disable RSpec/DescribeClass
describe 'single_use:reset_custom_fields_behavior_without_feature' do
  subject(:run) { task.invoke('execute') }

  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:reset_custom_fields_behavior_without_feature'] }
  let(:phase) { create(:single_phase_ideation_project, title_multiloc: { 'en' => 'Cycle paths' }).phases.first }
  let!(:permission) do
    create(:permission, action: 'posting_idea', permission_scope: phase, custom_fields_behavior: 'custom')
  end

  # What TenantScript writes a dry run to, and what the outreach list is drawn from.
  let(:dry_run_report) { 'reset_custom_fields_behavior_without_feature_dry_run.json' }

  after do
    task.reenable
    FileUtils.rm_f(dry_run_report)
  end

  def without_the_feature
    SettingsService.new.deactivate_feature!('permissions_custom_fields')
  end

  def stored_behavior(permission)
    Permission.where(id: permission.id).pick(:custom_fields_behavior)
  end

  it "puts a permission asking its own questions back on the platform's when the feature is off" do
    without_the_feature

    run

    expect(stored_behavior(permission)).to eq 'global'
  end

  it 'leaves a platform that has the feature alone' do
    run

    expect(stored_behavior(permission)).to eq 'custom'
  end

  it 'leaves the other behaviors alone' do
    without_the_feature
    permission.update!(custom_fields_behavior: 'disabled')

    run

    expect(stored_behavior(permission)).to eq 'disabled'
  end

  it 'changes nothing on a dry run' do
    without_the_feature

    task.invoke

    expect(stored_behavior(permission)).to eq 'custom'
  end

  # The dry run is what the outreach list is drawn from, so it has to name the project
  # rather than just count permissions.
  it 'reports every affected action, and where it lives, on a dry run' do
    without_the_feature
    host = Tenant.current.host

    task.invoke

    changes = JSON.parse(File.read(dry_run_report))['changes']
    expect(changes).to contain_exactly(
      hash_including(
        'old_value' => 'custom',
        'new_value' => 'global',
        'context' => hash_including(
          'tenant' => host,
          'permission_id' => permission.id,
          'action' => 'posting_idea',
          'project_slug' => phase.project.slug,
          'project_title' => 'Cycle paths'
        )
      )
    )
  end
end
# rubocop:enable RSpec/DescribeClass
