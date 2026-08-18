# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
describe 'single_use:delete_inherited_phase_permissions' do
  subject(:run) { task.invoke('execute') }

  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:delete_inherited_phase_permissions'] }
  let(:service) { Permissions::PermissionInheritanceService.new }
  let(:phase) { create(:single_phase_ideation_project).phases.first }
  let!(:visiting_permission) do
    create(:global_permission, action: 'visiting', permitted_by: 'users', require_name: false)
  end

  after { task.reenable }

  it 'deletes the phase permissions that are an exact copy of the visiting permission' do
    permission = service.override!(phase, 'posting_idea')

    run

    expect(Permission.where(id: permission.id)).to be_empty
  end

  it 'keeps a permission whose attributes differ' do
    permission = service.override!(phase, 'posting_idea')
    permission.update!(require_name: true)

    run

    expect(Permission.where(id: permission.id)).to be_present
  end

  it 'keeps a permission whose groups differ' do
    permission = service.override!(phase, 'posting_idea')
    permission.update!(groups: [create(:group)])

    run

    expect(Permission.where(id: permission.id)).to be_present
  end

  it 'keeps a permission whose demographic questions differ' do
    permission = service.override!(phase, 'posting_idea')
    permission.update!(global_custom_fields: false)
    create(:permissions_custom_field, permission: permission)

    run

    expect(Permission.where(id: permission.id)).to be_present
  end

  it 'never deletes the global permissions' do
    run

    expect(Permission.where(id: visiting_permission.id)).to be_present
  end

  it 'deletes nothing on a dry run' do
    permission = service.override!(phase, 'posting_idea')

    task.invoke

    expect(Permission.where(id: permission.id)).to be_present
  end
end
