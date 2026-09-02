# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListPhasePermissions do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists the permissions of the phase' do
    phase = create(:phase, with_permissions: true)
    create(:phase, with_permissions: true) # phase with its own permissions

    response = list(phase_id: phase.id)

    expect(response).not_to be_error

    expect(response.structured_content).to match(
      phase_id: phase.id,
      permissions: [
        a_hash_including(action: 'posting_idea', inherited: false),
        a_hash_including(action: 'commenting_idea', inherited: false),
        a_hash_including(action: 'reacting_idea', inherited: false),
        a_hash_including(action: 'attending_event', inherited: false)
      ]
    )
  end

  # A phase action has no permission row of its own until it is overridden;
  # until then it follows the global 'visiting' permission.
  # See Permissions::PermissionInheritanceService.
  context 'when the phase has not customised its permissions' do
    let!(:visiting_permission) do
      create(:global_permission, action: 'visiting', permitted_by: 'admins_moderators')
    end

    before { Permissions::PermissionInheritanceService.clear_source_permission_cache }

    it 'lists every action with the settings it inherits' do
      phase = create(:phase)

      response = list(phase_id: phase.id)

      expect(response).not_to be_error

      expect(response.structured_content).to match(
        phase_id: phase.id,
        permissions: [
          a_hash_including(action: 'posting_idea', inherited: true, permitted_by: 'admins_moderators'),
          a_hash_including(action: 'commenting_idea', inherited: true, permitted_by: 'admins_moderators'),
          a_hash_including(action: 'reacting_idea', inherited: true, permitted_by: 'admins_moderators'),
          a_hash_including(action: 'attending_event', inherited: true, permitted_by: 'admins_moderators')
        ]
      )
    end

    it 'reports the actions the phase has customised as its own' do
      phase = create(:phase)
      Permissions::PermissionInheritanceService.new.override!(phase, 'posting_idea')

      response = list(phase_id: phase.id)

      expect(response.structured_content[:permissions]).to match([
        a_hash_including(action: 'posting_idea', inherited: false),
        a_hash_including(action: 'commenting_idea', inherited: true),
        a_hash_including(action: 'reacting_idea', inherited: true),
        a_hash_including(action: 'attending_event', inherited: true)
      ])
    end
  end

  it 'serializes permission fields' do
    phase = create(:phase, with_permissions: true)

    response = list(phase_id: phase.id)

    expect(response.structured_content[:permissions].first)
      .to include(:action, :permitted_by, :group_ids)
  end

  it 'returns a not-found error when the phase is missing' do
    response = list(phase_id: SecureRandom.uuid)

    expect(response).to be_not_found('Phase')
  end
end
