# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's
# `config.pattern`). The predicate this task is built on —
# Permissions::PermissionInheritanceService#matches_source? — is covered by
# spec/services/permissions/permission_inheritance_service_spec.rb, which does run.
describe 'single_use:delete_inherited_phase_permissions' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:delete_inherited_phase_permissions'] }
  let(:phase) { create(:single_phase_ideation_project).phases.first }
  let!(:visiting_permission) do
    create(:global_permission, action: 'visiting', permitted_by: 'users', require_name: false)
  end

  after { task.reenable }

  it 'deletes the phase permissions that are an exact copy of the visiting permission' do
    permission = Permissions::PermissionInheritanceService.new.override!(phase, 'posting_idea')

    task.invoke

    expect(Permission.where(id: permission.id)).to be_empty
  end

  it 'keeps the phase permissions that differ from the visiting permission' do
    service = Permissions::PermissionInheritanceService.new
    customised = service.override!(phase, 'posting_idea')
    customised.update!(permitted_by: 'admins_moderators')
    with_groups = service.override!(phase, 'commenting_idea')
    with_groups.update!(groups: [create(:group)])

    task.invoke

    expect(Permission.where(id: [customised.id, with_groups.id]).count).to eq 2
  end

  it 'never deletes the global permissions' do
    task.invoke

    expect(Permission.where(id: visiting_permission.id)).to be_present
  end

  it 'deletes nothing in REPORT mode' do
    permission = Permissions::PermissionInheritanceService.new.override!(phase, 'posting_idea')

    stub_env('REPORT' => 'true')
    task.invoke

    expect(Permission.where(id: permission.id)).to be_present
  end
end
