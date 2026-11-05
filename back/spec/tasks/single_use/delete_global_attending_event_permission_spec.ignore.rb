# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
describe 'single_use:delete_global_attending_event_permission' do
  subject(:run) { task.invoke('execute') }

  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:delete_global_attending_event_permission'] }
  let!(:visiting_permission) do
    create(:global_permission, action: 'visiting', permitted_by: 'users', require_name: false)
  end
  let!(:attending_event_permission) do
    create(:global_permission, action: 'attending_event', permitted_by: 'admins_moderators')
  end

  after { task.reenable }

  it "deletes the global 'attending_event' permission, whatever it holds" do
    run

    expect(Permission.where(id: attending_event_permission.id)).to be_empty
  end

  it 'leaves the action inheriting the visiting permission' do
    run

    permission = Permissions::PermissionInheritanceService.new.find(nil, 'attending_event')
    expect(permission).to be_inherited
    expect(permission.require_name).to be false
  end

  it 'destroys the groups of the permission along with it' do
    attending_event_permission.update!(groups: [create(:group)])

    run

    expect(GroupsPermission.where(permission_id: attending_event_permission.id)).to be_empty
  end

  it 'never deletes the other global permissions' do
    run

    expect(Permission.where(id: visiting_permission.id)).to be_present
  end

  it 'never deletes a phase permission' do
    phase = create(:single_phase_ideation_project).phases.first
    permission = Permissions::PermissionInheritanceService.new.override!(phase, 'attending_event')

    run

    expect(Permission.where(id: permission.id)).to be_present
  end

  it 'deletes nothing on a dry run' do
    task.invoke

    expect(Permission.where(id: attending_event_permission.id)).to be_present
  end
end
